import { exec } from 'child_process';
import * as parseIsoDuration from 'parse-iso-duration';
import * as path from 'path';
import * as requestPromise from 'request-promise-native';
import { Observable } from 'rxjs/Observable';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { of } from 'rxjs/observable/of';
import { map, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import * as ytdl from 'youtube-dl';
import { appConfig } from '../config';
import { Song } from '../db/models/song.model';
import { SongMetadata } from '../shared/interfaces/song-metadata.interface';

export class SongService {
  // Todo
  private inProgress: { [key: string]: Observable<Song> };

  downloadSong(songMetadata: SongMetadata): Observable<SongMetadata> {
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

  getMetadata(youtubeId: string): Observable<SongMetadata> {
    return fromPromise(
      requestPromise.get(
        `https://www.googleapis.com/youtube/v3/videos?id=${youtubeId}&part=contentDetails,snippet&key=${appConfig.youtube.apiKey}`
      )
    ).pipe(
      map(res => JSON.parse(res).items[0])
    );
  }

  getSong(youtubeId: string): Observable<Song> {
    return Song.findOne<Song>({youtubeId: youtubeId})
      .pipe(
        switchMap(song => {
          if (song) {
            return of(song);
          }

          return this.getMetadata(youtubeId).pipe(
            switchMap(songMetadata => this.downloadSong(songMetadata)),
            switchMap(songMetadata => this.normalizeMp3(songMetadata)),
            map(songMetadata => {
              const s = new Song(
                parseIsoDuration(songMetadata.contentDetails.duration),
                songMetadata.id,
                songMetadata.snippet.title
              );

              // Todo
              s.save().subscribe();

              return s;
            })
          );
        })
      );
  }

  normalizeMp3(songMetadata: SongMetadata): Observable<SongMetadata> {
    const sub = new Subject<SongMetadata>();
    const songPath = path.join(appConfig.songs.directory, songMetadata.id + '.mp3');

    exec(`mp3gain -c -p -r -d ${appConfig.songs.normalizationDb - 89} ${songPath}`, (err, stdout, stderr) => {
      if (err) {
        sub.error(err);
      } else {
        sub.next(songMetadata);
      }

      sub.complete();
    });

    return sub;
  }
}
