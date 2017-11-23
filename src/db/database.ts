import { Db, MongoClient } from 'mongodb';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { appConfig } from '../config';

export class Database {
  private static db: Db;
  private static isConnected = false;

  static connect(): Observable<Db> {
    const sub = new Subject<Db>();

    if (Database.isConnected) {
      sub.next(Database.db);
      sub.complete();
    } else {
      MongoClient.connect(Database.getUri(), (error, db) => {
        if (error) {
          sub.error(error);
          return;
        }

        db.on('close', () => {
          Database.isConnected = false;
          Database.db = null;
        });

        Database.db = db;
        sub.next(db);
        sub.complete();
      });
    }

    return sub;
  }

  private static getUri(): string {
    const c = appConfig.db.connection;
    return 'mongodb://' +
      ((c.username || c.password) ? `${c.username}:${c.password}@` : '') +
      `${c.host}:${c.port}` +
      `/${c.database}` +
      (c.options ? `?${c.options}` : '');
  }
}
