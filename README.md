# Nano Stream Tip

Nano Stream Tip lets you accept XNO (Nano currency) using [NanoPay.me](https://github.com/nanopay/nanopay.me), and then sends an alert which will be displayed live on your Twitch or Youtube stream via [StreamElements](https://streamelements.com).

![image](https://github.com/user-attachments/assets/2a699397-298d-480a-968c-0259708f5a1f)


# Server config
The server settings are configurable with a .env file.

I have included an EXAMPLE.ENV, but basically this needs to contain the following:

```
NANOPAY_TOKEN= This should be your NanoPay.me API token.
STREAMELEMENTS_JWT= This is your personal StreamElements JWT API Token
STREAMELEMENTS_CHANNEL_ID= Your StreamElements Account ID
NANO_ADDRESS= Your Nano wallet address, as in... the wallet you want the funds to be sent to.
REDIRECT_URL= The website you want the viewer to be redirected to after they have payed.
STREAM_CHANNEL= Your twitch channel, like twitch.tv/jenoki. Don't need the https here.
```

Sign up with [NanoPay.me](https://github.com/nanopay/nanopay.me) to get your own API token.

You can find your StreamElements JWT token and Channel/Account ID here in your [StreamElements account settings](https://streamelements.com/dashboard/account/channels)

![image](https://github.com/user-attachments/assets/da7d6662-10c9-42df-8aa8-6010986da84c)

# Frontend Config

You can edit and style index.html as you see fit!

### You'll certainly need to change the following line:<br>
`const backendURL = "https://api.jenoki.net"; // Change this to wherever you're hosting your backend.`
<br>You'll need to point this to wherever you're hosting the server.js etc.

### Change the channel/user who is being tipped:<br>
`<h1>Tip Jenoki<br>with Ӿ (Nano)!</h1>`
<br>Change that to your own channel name!

### I would recommend changing the minimum tip amount to whatever you'd prefer
`<input type="number" id="amount" placeholder="Amount in Ӿ (XNO)" min="0.01" step="0.01" required><br>`
<br>On this line change the min="0.01" to whatever value you like.

# See it live in action, maybe...
I sometimes stream on https://twitch.tv/jenoki
<br><sup>what? i gotta plug my channel somehwere ok?</sup>
