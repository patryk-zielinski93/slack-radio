import * as IORedis from 'ioredis';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { map } from 'rxjs/operators';
import { appConfig } from '../../config';

export class QueueController<T> {
  private redis: IORedis.Redis;

  constructor(private queueName: string) {
    this.redis = new IORedis(appConfig.redis.port, appConfig.redis.host);
  }

  pop(): Observable<T> {
    return fromPromise(this.redis.rpop(this.queueName))
      .pipe(
        map(val => {
          let v;
          try {
            v = JSON.parse(val);
          } catch (e) {
            v = val;
          }
          return v;
        })
      );
  }

  push(data: T): void {
    let v;

    try {
      v = JSON.stringify(data);
    } catch (e) {
      v = data;
    }

    this.redis.lpush(this.queueName, v);
  }
}
