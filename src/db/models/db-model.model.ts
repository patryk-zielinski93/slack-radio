import { UpdateWriteOpResult } from 'mongodb';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { map, switchMap } from 'rxjs/operators';
import { Database } from '../database';
import { Model, ModelProp } from './model.model';

const modelCollectionKey = '__ModelCollection__';

export function DbModelClass(collectionName: string): ClassDecorator {
  return (target) => {
    target[modelCollectionKey] = collectionName;
  };
}

export abstract class DbModel extends Model {
  @ModelProp()
  _id: string;

  @ModelProp(Date)
  createdAt: Date;

  @ModelProp(Date)
  updatedAt: Date | undefined;

  static find<T>(filter: { [key: string]: any }): Observable<T[]> {
    return Database.connect().pipe(
      switchMap(db => fromPromise(
        db.collection(this[modelCollectionKey])
          .find(filter)
          .toArray()
        )
      ),
      map(o => o.map(obj => (<any>this).deserialize(obj)))
    );
  }

  static findOne<T>(filter: { [key: string]: any }): Observable<T | null> {
    return Database.connect().pipe(
      switchMap(db => fromPromise(
        db.collection(this[modelCollectionKey])
          .find(filter)
          .limit(1)
          .toArray()
        )
      ),
      map(o => (<any>this).deserialize(o.length ? o[0] : null))
    );
  }

  static findOneById<T>(id: string): Observable<T | null> {
    return Database.connect().pipe(
      switchMap(db => fromPromise(
        db.collection(this[modelCollectionKey])
          .find({_id: id})
          .limit(1)
          .toArray()
        )
      ),
      map(o => (<any>this).deserialize(o.length ? o[0] : null))
    );
  }

  static remove<T>(id: string): Observable<T | null> {
    return Database.connect().pipe(
      switchMap(db => fromPromise(
        db.collection(this[modelCollectionKey])
          .deleteOne({_id: id})
        )
      ),
      map(o => (<any>this).deserialize(o))
    );
  }

  save(): Observable<UpdateWriteOpResult> {
    const collection = this.constructor[modelCollectionKey];

    return Database.connect().pipe(
      switchMap(db => {
        if (this._id) {
          this.updatedAt = new Date();
          return fromPromise(db.collection(collection).updateOne({_id: this._id}, this.serialize()));
        }

        this.createdAt = new Date();
        return fromPromise(db.collection(collection).insertOne(this.serialize()));
      })
    );
  }
}
