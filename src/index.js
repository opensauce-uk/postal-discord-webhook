const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const { WebhookClient, MessageEmbed, MessageAttachment  } = require('discord.js');
const centra = require('@aero/centra');
const fs = require('fs');
const util = require('../lib/util');
const chalk = require('chalk');
const htmlToText = require('html-to-text');
require('dotenv').config();
const port = process.env.PORT;
const postal_url = process.env.POSTAL_URL;
const org = process.env.POSTAL_ORG;
const server = process.env.POSTAL_SERVER;
app.get('/', (req, res) => {
      res.status(200).send('OK!');
});

app.post('/', jsonParser, async (req, res) => {
    try {
        const postal = await centra(`${postal_url}/api/v1/messages/message`).body({id: req.body.id}).header('X-Server-API-Key', process.env.POSTAL_TOKEN).json();
        if (postal.data.code == 'MessageNotFound') {
            util.error(`Could not find email with the ID ${req.body.id} on Postal.`)
            return res.status(500).send({ error: 'Postal was unable to find the specified email' });
        }
        if (req.body.token !== postal.data.token) {
            util.auth(`Could not validate token ${req.body.token} when correct token is ${postal.data.token}`)
            util.debug(`Email ID Given: ${req.body.id}`)
            util.debug(`Email ID on postal: ${postal.data.id}`)
            return res.status(500).send({ error: 'The token specified doesn\'t match the token stored on Postal'});
        }

        if (!req.body.plain_body) {
            let text = htmlToText.fromString(req.body.html_body, {
                wordwrap: false,
                hideLinkHrefIfSameAsText: true,
                ignoreImage: true,
                ignoreHref: true,
                preserveNewlines: true
              });       
              req.body.plain_body = text.replace(/\[+([^\][]+)]+/g, '')
        }
        if (req.body.plain_body.length > 1918) req.body.plain_body = req.body.plain_body.slice(0, 1918)
        const embed = new MessageEmbed()
        .setTitle(req.body.subject)
        .setColor('#00b0f4')
        .setDescription(`${req.body.plain_body}\n\n[Click here to see HTML version](${postal_url}/org/${org}/servers/${server}/messages/${postal.data.id}/html_raw)`)
        .setTimestamp()

        const attachments = req.body.attachments
        let attachment = []


         if (attachments.length) {
            for (i = 0; i < attachments.length; i++) {
                let file = attachments[i];
                file = file.data.replace('/n', '').replace('/', '');
                let name = attachments[i].filename.replace(' ', '')
                fs.writeFile(name, attachments[i].data, {encoding: 'base64'}, function(err) {
                    util.log(`Created file ${name}`);
                });
                attachment.push(new MessageAttachment(name))
            }
         }

         let deleteFile =  function deleteFile() {
            if (attachments.length) {
                for (i = 0; i < attachments.length; i++) {
                    let file = attachments[i];
                    file = file.data.replace('/n', '').replace('/', '');
                    let name = attachments[i].filename.replace(' ', '')
                    fs.unlink(name, (err) => {
                        if (err) {
                          console.error(err)
                        }
                        util.log(`Deleted file ${name}`)
                    })
                }
             }
         }
        const hook = new WebhookClient(process.env.HOOK_ID, process.env.HOOK_TOKEN)
        hook.send({
        username: req.body.from,
        avatarURL: 'https://i.imgur.com/a48jQ8J.png',
        embeds: [embed],
        files: attachment });        
        setTimeout(deleteFile, 5000);
        res.status(200).send(`Successfully sent email to discord!`)
          } catch(error) {
        console.log(error)
        res.status(500).send({error: error.message})
    }
})

app.listen(port, () => {
    console.log(chalk.green('--------------------------------------------------------'));
    console.log(chalk.blue(`Starting Postal to Discord Webhook Server on port ${port}`));
    console.log(chalk.green('--------------------------------------------------------'));
    })