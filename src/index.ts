import { CLIENT_EVENTS, RTM_EVENTS, RtmClient, WebClient } from '@slack/client';
import { appConfig } from './config';

const rtm = new RtmClient(appConfig.token);
const web = new WebClient(appConfig.token);

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  if (message.text === 'Hello.') {
    web.users.info(message.user, (err, result) => {
      console.log(result);
    });
    rtm.sendMessage('Hello <@' + message.user + '>!', message.channel);
  }
});
