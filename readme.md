# [postal-discord-webhook](https://github.com/opensauce-uk/postal-discord-webhook)
#### Introduction
An express web server used to receive HTTP requests from postal, after checking if its a valid request it will fetch all the data and send it to discord in an embed with any attachments. The second function of this web server is to also send basic emails to people e.g Sign up emails, password resets and alike.

#### Installing 
```
git clone https://github.com/opensauce-uk/postal-discord-webhook
cd postal-discord-webhook
npm install
mv example.env .env
```
#### Configuring 
There isn't much to configure as everything is stored in environment variables make sure to open `.env` and edit the values.
```
# Port that the web server listens too
PORT=3000
# API token of postal instance 
POSTAL_TOKEN=xyz
# Discord Webhook ID
HOOK_ID=1234
# Discord Webhook Token
HOOK_TOKEN=discord_hook_token
# Full Postal instance url
POSTAL_URL=https://postal.example.com
# Postal org used
POSTAL_ORG=postal
# Postal server used
POSTAL_SERVER=postal
# Postal Sender Email
FROM_USER=no-reply@postal.com
``` 

#### Running
Assuming you have configured everything you can use one of the commands below to run the server.
```
node .
npm run start
```
