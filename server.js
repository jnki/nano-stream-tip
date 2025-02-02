const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json()); // ✅ Ensure JSON body parsing

const PORT = process.env.PORT || 3000;
const API_TOKEN = process.env.NANOPAY_TOKEN;
const cors = require("cors");
app.use(cors()); // ✅ Allow frontend requests

// 🔥 Correct `/create-invoice` route
app.post("/create-invoice", async (req, res) => {
    console.log("Received request:", req.body); // ✅ Debugging
    
    const { username, amount, message } = req.body;
    const streamchannel = "twitch.tv/jenoki";                     // ⬅️ SET THIS TO YOUR OWN CHANNEL! it will show up as the tip description

    if (!username || !amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: "Invalid input" });
    }

    const recipientAddress = "nano_1rnmtpo78c3o37otjqmaoji78sgyjwaaywg1r7pzncaeiqxiz7344nhuqny1"; // ⬅️ Replace with your own Nano address

    try {
        const response = await fetch("https://nanopay.me/api/invoices", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                title: `Tip from ${username}`,  // ✅ Required field
                description: `Sending tip to ${streamchannel}`,
                price: parseFloat(amount),  // ✅ Keep this
                recipient_address: recipientAddress, // ✅ Required field
                metadata: { username, message },
                redirect_url: "https://jenoki.net"      // ⬅️ Replace with your own site or twitch channel
            })
        });

        const data = await response.json();
        console.log("NanoPay API Response:", data); // ✅ Debugging log
        console.log("Using API Token:", API_TOKEN); // ✅ Debugging

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
    console.log("🔥 Full NanoPay Webhook Data:", JSON.stringify(req.body, null, 2)); // ✅ Log full request data

    const { type, invoice, payment } = req.body;

    // ✅ Extract values from correct locations
    const status = invoice?.status;
    const amount_received = payment?.amount;  // ✅ Get amount from 'payment.amount'
    const metadata = invoice?.metadata;

    if (!status) {
        console.warn("⚠️ Webhook received, but 'status' is missing.");
        return res.sendStatus(400);
    }

    if (status !== "paid" && status !== "pending") {  // ✅ Accept both
        console.warn(`⚠️ Webhook received, but status is '${status}', not 'paid' or 'pending'.`);
        return res.sendStatus(200);
    }

    if (!metadata?.username) {
        console.warn("⚠️ Webhook received, but missing metadata.username");
        return res.sendStatus(400);
    }

    const username = metadata.username;
    const message = metadata.message || "No message";
    const amount = parseFloat(amount_received); // ✅ Convert to number

    console.log(`✅ Payment received from ${username}: ${amount} XNO`);

    // 🚀 Call the function to send an alert to StreamElements
    await sendStreamElementsAlert(username, message, amount);

    res.sendStatus(200); // Acknowledge webhook received
});

// Send Alert to StreamElements

async function sendStreamElementsAlert(username, message, amount) {
    const SE_JWT_TOKEN = process.env.STREAMELEMENTS_JWT; // StreamElements API Token
    const SE_CHANNEL_ID = process.env.STREAMELEMENTS_CHANNEL_ID; // Your StreamElements Channel ID

        // 🚀 Get real-time Nano (XNO) to USD conversion rate
    const exchangeRate = await getNanoToUsdRate();
    const amountInUsd = (amount * exchangeRate).toFixed(2); // Convert XNO to USD
    
    const tipData = {
        user: {
            userId: "",  // Optional: StreamElements user ID (if available)
            username: username,  // ✅ The tipper's username
            email: "no-reply@example.com"  // Required, but we use a placeholder
        },
        provider: "NanoPay",  // ✅ Identifying the source of the tip
        message: `Ӿ${amount} XNO - ${message}`,  // ✅ The message sent with the tip
        amount: parseFloat(amountInUsd),  // ✅ Convert XNO to USD
        currency: "USD",  // ✅ StreamElements expects a currency field, Use USD since XNO isn't supported.
        imported: true  // ✅ This tells StreamElements the tip is external (not via SE Pay)
    };

    try {
        const response = await fetch(`https://api.streamelements.com/kappa/v2/tips/${SE_CHANNEL_ID}`, {
            method: "POST",
            headers: {
                "Accept": "application/json; charset=utf-8, application/json",
                "Authorization": `Bearer ${SE_JWT_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(tipData)
        });

        const responseText = await response.text(); // Get raw response for debugging
        console.log(`StreamElements Response: ${responseText}`); // ✅ Log full response

        if (!response.ok) {
            console.error("❌ Failed to send StreamElements tip:", responseText);
        } else {
            console.log(`✅ StreamElements tip sent for ${username}: ${amount} XNO (~$${amountInUsd} USD)`);
        }
    } catch (error) {
        console.error("❌ Error sending tip to StreamElements:", error);
    }
}

// 🔥 Function to get the current Nano (XNO) to USD exchange rate
async function getNanoToUsdRate() {
    try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=nano&vs_currencies=usd");
        const data = await response.json();
        return data.nano.usd; // Return Nano price in USD
    } catch (error) {
        console.error("❌ Failed to get Nano price:", error);
        return 5.00; // Fallback rate (manual estimate)
    }
}

// Start the server
app.get("/", (req, res) => {
    res.send("🚀 Server is running!");
});
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));