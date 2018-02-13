import * as IORedis from 'ioredis';
import { queue } from 'rxjs/scheduler/queue';
import { appConfig } from '../../config';

export class QueueController {
  private queue: any[] = [];
  private sub: IORedis.Redis;
  private pub: IORedis.Redis;

  constructor() {
    this.setNextSong = this.setNextSong.bind(this);
    this.sub = new IORedis(appConfig.redis.port, appConfig.redis.host);
    this.pub = new IORedis(appConfig.redis.port, appConfig.redis.host);
    this.sub.subscribe('getNext');
    this.sub.on('message', this.setNextSong);
  }

  push(data): void {
    this.queue.push(data);
  }

  private setNextSong(channel: string, message: string): void {
    console.log('get NEXTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT');
    if (this.queue.length) {
      const filePath = this.queue.shift().song.filePathForIces;

      this.pub.set('next_song', filePath);
    }
  }
}
