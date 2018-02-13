const { IncomingWebhook, WebClient, RtmClient } = require('@slack/client');
require('dotenv').config();

const timeNotification = new IncomingWebhook(process.env.WEBHOOK_URL_BOTEX);
const currentTime = new Date().toTimeString();
const web = new WebClient(process.env.WEB_API_TOKEN);


timeNotification.send(`The current time is ${currentTime}`, (error, resp) => {
  if (error) {
    return console.error(error);
  }
  console.log('Notification sent');

  setTimeout(() => {
    console.log('Calling search.messages');
    web.search.messages('webhookbot')
      .then(resp => {
        if (resp.messages.total > 0) {
          console.log('First match:', resp.messages.matches[0]);
        } else {
          console.log('No matches found');
        }
      })
      .catch(console.error)
  }, 3000);
});
