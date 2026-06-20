# Nano Stream Tip

Nano Stream Tip lets you accept XNO (Nano currency) using [NanoPay.me](https://github.com/nanopay/nanopay.me), and then sends an alert which will be displayed live on your Twitch or Youtube stream via [Streamer.bot](https://streamer.bot).

![image](https://github.com/user-attachments/assets/a7705274-f7c4-4f5c-9278-4c2f1f63803b)


# Server config
The server settings are configurable with a .env file.

I have included an EXAMPLE.ENV, but basically this needs to contain the following:

```
NANOPAY_TOKEN= This should be your NanoPay.me API token.
COINKGECKO_API_KEY= This should be your Coingecko API token...
STREAMERBOT_ACTION_ID= Right click on your Action in streamer.bot and copy/paste the ID
STREAMERBOT_ACTION_NAME= The name of the Action in streamer.bot
STREAMERBOT_URL= URL for your tunnel to streamer.bot
NANO_ADDRESS= Your Nano wallet address, as in... the wallet you want the funds to be sent to.
REDIRECT_URL= The website you want the viewer to be redirected to after they have payed.
STREAM_CHANNEL= Your twitch channel, like twitch.tv/jenoki. Don't need the https here.
```

Sign up with [NanoPay.me](https://github.com/nanopay/nanopay.me) to get your own API token.<br>
You'll also need to create a Webhook in NanoPay.Me, and set the "Hook URL" to your backend, followed by /nanopay_webhook e.g. `https://yourbackend.url/nanopay_webhook`

# Streamer.bot config

You'll need to create an "Action" in streamer bot<br>
Name it "Nano Tip Alert"<br>
(and while you're at it, right click on the name and copy the Action ID, as you'll need it for your .env)<br>
In the "Sub-Actions" section, right click and go to Add>Core>C# Execute C# Code<br>
Replace everything in that box with the following<br>
```
using System;

public class CPHInline
{
    public bool Execute()
    {
        string tipName    = args["tipName"].ToString();
        string tipAmount  = args["tipAmount"].ToString();
        string tipAmountUsd = args["tipAmountUsd"].ToString();
        string tipMessage = args["tipMessage"].ToString();

        string jsonPayload = $@"{{
            ""event"": ""nano_tip"",
            ""name"": ""{tipName}"",
            ""amount"": ""{tipAmount}"",
            ""amountUsd"": ""{tipAmountUsd}"",
            ""message"": ""{tipMessage}""
        }}";

        CPH.WebsocketBroadcastJson(jsonPayload);
        return true;
    }
}
```
Click Compile, then Compile and Save.

### Enable WebSocket Server<br>
Set to Auto Start<br>
Address: 127.0.0.1 <br>
Port: 8080<br>
Start Server

### Enable HTTP Server
Set to Auto Start<br>
Address: 127.0.0.1<br>
Port: 7474
Start Server

# Frontend Config (Your tip page!)

The frontend is the images folder and the index.html.<br>
You can edit and style index.html, and add images/logos as you see fit!

### You'll certainly need to change the following line in index.html:<br>
`const backendURL = "https://api.jenoki.net"; // Change this to wherever you're hosting your backend.`
<br>You'll need to point this to wherever you're hosting the server.js etc.

### Change the channel/user who is being tipped:<br>
`<h1>Tip Jenoki<br>with Ӿ (Nano)!</h1>`
<br>Change that to your own channel name!

### I would recommend changing the minimum tip amount to whatever you'd prefer
`<input type="number" id="amount" placeholder="Amount in Ӿ (XNO)" min="0.01" step="0.01" required><br>`
<br>On this line change the min="0.01" to whatever value you like.

# Overlay Alert
<img width="514" height="243" alt="image" src="https://github.com/user-attachments/assets/f4c6de0a-d6a5-4bad-b782-c6a150a4bb60" />

I've included a very basic example alert overlay (nano-tip-alert-demo.html).<br>
You can check the source and have a look at the WebSocket section.<br>
That's how the tip info will be sent from streamer.bot into your overlay.

# See it live in action, maybe...
I sometimes stream on https://twitch.tv/jenoki
<br><sup>what? i gotta plug my channel somehwere ok?</sup>
