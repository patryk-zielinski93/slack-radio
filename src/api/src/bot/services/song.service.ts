import { exec } from 'child_process';
import * as path from 'path';
import * as requestPromise from 'request-promise-native';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { of } from 'rxjs/observable/of';
import { map, switchMap, tap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import * as ytdl from 'youtube-dl';
import { appConfig } from '../../config';
import { Song } from '../../db/models/song.model';
import { SongMetadata } from '../../shared/interfaces/song-metadata.interface';

export class SongService {
  private static instance: SongService;
  private inProgress: { [key: string]: Observable<Song> } = {};

  static getInstance(): SongService {
    return this.instance || (this.instance = new this());
  }

  private constructor() {
  }

  getMetadata(youtubeId: string): Observable<SongMetadata> {
    return fromPromise(
      requestPromise.get(
        `https://www.googleapis.com/youtube/v3/videos?id=${youtubeId}&part=contentDetails,snippet&key=${appConfig.youtube.apiKey}`
      )
    ).pipe(
      map(res => {
        const metadata = JSON.parse(res).items[0];

        if (!metadata) {
          Observable.throw(new Error('Wrong youtube viedeo id.'));
        }

        return metadata;
      })
    );
  }

  getSong(youtubeId: string): Observable<Song> {
    if (this.inProgress[youtubeId]) {
      return this.inProgress[youtubeId];
    }

    const obs = Song.findOne<Song>({youtubeId: youtubeId})
      .pipe(
        switchMap(song => {
          if (song) {
            return of(song);
          }

          return this.getMetadata(youtubeId).pipe(
            switchMap(songMetadata => this.downloadSong(songMetadata)),
            switchMap(songMetadata => this.normalizeMp3(songMetadata)),
            switchMap(songMetadata => this.setRealMp3Length(songMetadata)),
            switchMap(songMetadata => {
              const s = new Song(
                parseInt(songMetadata.contentDetails.duration, 10),
                songMetadata.id,
                songMetadata.snippet.title
              );

              return s.save<Song>();
            }),
            tap(() => {
              delete this.inProgress[youtubeId];
            })
          );
        })
      );

    this.inProgress[youtubeId] = obs;

    return obs;
  }

  private downloadSong(songMetadata: SongMetadata): Observable<SongMetadata> {
    const sub = new Subject<SongMetadata>();

    ytdl.exec(`https://www.youtube.com/watch?v=${songMetadata.id}`, [
      '--restrict-filenames',
      '--geo-bypass-country', 'PL',
      '-o', path.join(appConfig.songs.directory, songMetadata.id + '.%(ext)s'),
      '--extract-audio',
      '--audio-format', 'mp3'
    ], {}, (err, output) => {
      if (err) {
        sub.error(err);
        sub.complete();
        return;
      }

      sub.next(songMetadata);
      sub.complete();
    });

    return sub;
  }

  private normalizeMp3(songMetadata: SongMetadata): Observable<SongMetadata> {
    const sub = new Subject<SongMetadata>();
    const songPath = path.join(appConfig.songs.directory, songMetadata.id + '.mp3');

    exec(`mp3gain -c -p -r -d ${appConfig.songs.normalizationDb - 89} ${songPath} && \\
sox ${songPath} ${songPath}.temp.mp3 silence 1 2 0.1% reverse silence 1 2 0.1% reverse && \\
rm ${songPath} && \\
mv ${songPath}.temp.mp3 ${songPath}
`, (err, stdout, stderr) => {
      if (err) {
        sub.error(err);
      } else {
        sub.next(songMetadata);
      }

      sub.complete();
    });

    return sub;
  }

  private setRealMp3Length(songMetadata: SongMetadata): Observable<SongMetadata> {
    const sub = new Subject<SongMetadata>();
    const songPath = path.join(appConfig.songs.directory, songMetadata.id + '.mp3');

    exec(`mp3info -p "%S" ${songPath}`,
      (err, stdout, stderr) => {
        if (err) {
          sub.error(err);
        } else {
          songMetadata.contentDetails.duration = stdout;
          sub.next(songMetadata);
        }

        sub.complete();
      });

    return sub;
  }
}
