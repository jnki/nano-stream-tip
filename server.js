const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_TOKEN = process.env.NANOPAY_TOKEN;
const cors = require("cors");
app.use(cors());

app.post("/create-invoice", async (req, res) => {
    console.log("Received request:", req.body);

    const { username, amount, message } = req.body;
    const streamchannel = process.env.STREAM_CHANNEL;

    if (!username || !amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Invalid input" });
    }

    const recipientAddress = process.env.NANO_ADDRESS;
    const redirectUrl = process.env.REDIRECT_URL;

    try {
        const response = await fetch("https://nanopay.me/api/invoices", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                title: `Tip from ${username}`,
                description: `Sending tip to ${streamchannel}`,
                price: parseFloat(amount),
                recipient_address: recipientAddress,
                metadata: { username, message },
                redirect_url: redirectUrl
            })
        });

        const data = await response.json();
        console.log("NanoPay API Response:", data);

        if (data.pay_url) {
            res.json({ payment_url: data.pay_url });
        } else {
            res.status(400).json({ error: "Failed to create invoice", details: data });
        }
    } catch (error) {
        console.error("Error creating invoice:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Webhook Endpoint

app.post("/nanopay-webhook", async (req, res) => {
    console.log("🔥 Full NanoPay Webhook Data:", JSON.stringify(req.body, null, 2));

    const { type, invoice, payment } = req.body;

    const status = invoice?.status;
    const amount_received = payment?.amount;
    const metadata = invoice?.metadata;

    if (!status) {
        console.warn("⚠️ Webhook received, but 'status' is missing.");
        return res.sendStatus(400);
    }

    if (status !== "paid" && status !== "pending") {
        console.warn(`⚠️ Webhook received, but status is '${status}', not 'paid' or 'pending'.`);
        return res.sendStatus(200);
    }

    if (!metadata?.username) {
        console.warn("⚠️ Webhook received, but missing metadata.username");
        return res.sendStatus(400);
    }

    const username = metadata.username;
    const message = metadata.message || "No message";
    const amount = parseFloat(amount_received);

    console.log(`✅ Payment received from ${username}: ${amount} XNO`);

    await sendStreamerBotAlert(username, message, amount);

    res.sendStatus(200);
});

// Send alert to Streamer.bot

async function sendStreamerBotAlert(username, message, amount) {
    const exchangeRate = await getNanoToUsdRate();
    const amountInUsd = (amount * exchangeRate).toFixed(2);

    try {
        const response = await fetch(`${process.env.STREAMERBOT_URL}/DoAction`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: {
                    id: process.env.STREAMERBOT_ACTION_ID,
                    name: process.env.STREAMERBOT_ACTION_NAME
                },
                args: {
                    tipName: username,
                    tipAmount: String(amount),
                    tipAmountUsd: amountInUsd,
                    tipMessage: message
                }
            })
        });

        if (response.status === 204) {
            console.log(`✅ Streamer.bot action triggered for ${username}: ${amount} XNO (~$${amountInUsd} USD)`);
        } else {
            console.error("❌ Streamer.bot error:", response.status, await response.text());
        }
    } catch (error) {
        console.error("❌ Error contacting Streamer.bot:", error);
    }
}

// Get current Nano (XNO) to USD exchange rate

async function getNanoToUsdRate() {
    console.log("🔑 API Key present:", !!process.env.COINGECKO_API_KEY);
    try {
        const response = await fetch("https://pro-api.coingecko.com/api/v3/simple/price?ids=nano&vs_currencies=usd", {
            headers: {
                "x-cg-demo-api-key": process.env.COINGECKO_API_KEY
            }
        });
        const data = await response.json();
        if (data.nano?.usd) {
            console.log(`✅ Nano price: $${data.nano.usd}`);
            return data.nano.usd;
        }
        throw new Error("No price in response: " + JSON.stringify(data));
    } catch (error) {
        console.error("❌ Failed to get Nano price:", error);
        return 5.00; // fallback rate
    }
}

// Start the server
app.get("/", (req, res) => {
    res.send("🚀 Server is running!");
});
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
