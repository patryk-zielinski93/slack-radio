import { Song } from '../../db/models/song.model';

export interface QueuedSong {
  song: Song;
  userId: string;
}
