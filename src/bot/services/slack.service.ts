import { RtmClient, WebClient } from '@slack/client';
import { appConfig } from '../../config';

export class SlackService {
  private static instance: SlackService;

  get rtm(): RtmClient {
    return this._rtm;
  }

  get web(): WebClient {
    return this._web;
  }

  static getInstance(): SlackService {
    if (SlackService.instance) {
      return SlackService.instance;
    }

    SlackService.instance = new SlackService(
      new RtmClient(appConfig.slack.token),
      new WebClient(appConfig.slack.token)
    );

    return SlackService.instance;
  }

  private constructor(private _rtm: RtmClient, private _web: WebClient) {
    this._rtm.start();
  }
}
