import { CLIENT_EVENTS, MessageEvent, RTM_EVENTS, UsersInfoResult } from '@slack/client';
import { Observable } from 'rxjs/Observable';
import { bindNodeCallback } from 'rxjs/observable/bindNodeCallback';
import { tap } from 'rxjs/operators';
import { QueuedSong } from '../../shared/interfaces/queued-song.interface';
import { Utils } from '../../shared/utils';
import { SlackService } from '../services/slack.service';
import { SongService } from '../services/song.service';
import { QueueController } from './queue.controller';

// Todo: move to database
const helpMessage = function (user: string) {
  return `Cześć <@${user}>! Coś źle mi wstukujesz :(. Łap listę poleceń!

\`y <youtubelink>\` - jeżeli chcesz żebym zagrał coś specjalnie dla Ciebie, koniecznie wypróbuj to polecenie
`;
};

export class SlackController {
  private queue = new QueueController<QueuedSong>('songQueue');
  private slack = SlackService.getInstance();
  private songService = SongService.getInstance();

  constructor() {
    this.handleMessage = this.handleMessage.bind(this);

    this.slack.rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
      console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}.`);
    });

    this.slack.rtm.on(RTM_EVENTS.MESSAGE, this.handleMessage);
  }

  getUserInfo(userId: string): Observable<UsersInfoResult> {
    const asObservable = bindNodeCallback((user: string, callback: (err: Error, result: UsersInfoResult) => void) =>
      this.slack.web.users.info(user, callback)
    );

    return asObservable(userId);
  }

  handleMessage(message: MessageEvent): void {
    if (!message.text) {
      this.sendErrorMessage(message.channel);
      return;
    }

    const command = message.text.split(' ');
    const userInfo = this.getUserInfo(message.user);

    switch (command[0]) {
      case 'y': {
        this.songService
          .getSong(Utils.extractVideoIdFromYoutubeUrl(command[1]))
          .pipe(
            tap(song => {
              song.save();
            })
          )
          .subscribe(song => {
            this.queue.push({
              song: song,
              userId: message.user
            });

            this.slack.rtm.sendMessage(`Dodałem do playlisty (${song.title}).`, message.channel);
          }, (err) => {
            this.sendErrorMessage(message.channel);
          });
        break;
      }

      default: {
        this.slack.rtm.sendMessage(helpMessage(message.user), message.channel);
      }
    }
  }

  sendErrorMessage(channel: string): void {
    this.slack.rtm.sendMessage('Ups! Coś poszło nie tak :(', channel);
  }
}
