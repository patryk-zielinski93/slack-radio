import * as IORedis from 'ioredis';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { appConfig } from '../config';

export class QueueService {
  private redis: IORedis.Redis;

  constructor(private queueName: string) {
    this.redis = new IORedis(appConfig.redis.port, appConfig.redis.host);
  }

  pop(): Observable<string> {
    return fromPromise(this.redis.rpop(this.queueName));
  }

  push(s: string): void {
    this.redis.lpush(this.queueName, s);
  }
}
