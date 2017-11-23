import { CLIENT_EVENTS, RTM_EVENTS, RtmClient, WebClient } from '@slack/client';
import 'reflect-metadata';
import { appConfig } from './config';
import { SongService } from './services/song.service';

const rtm = new RtmClient(appConfig.slack.token);
const web = new WebClient(appConfig.slack.token);

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

const ss = new SongService();
ss.getSong('VfLf7A_-1Vw').subscribe(song => {
  console.log(song);
  song.save();
}, (err) => {
  console.log(err);
});
