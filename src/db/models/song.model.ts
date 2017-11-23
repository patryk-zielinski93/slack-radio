import * as path from 'path';
import { appConfig } from '../../config';
import { DbModel, DbModelClass } from './db-model.model';
import { ModelProp } from './model.model';

@DbModelClass('songs')
export class Song extends DbModel {
  @ModelProp()
  duration: number;
  @ModelProp(Date)
  lastPlayed: Date;
  @ModelProp()
  title: string;
  @ModelProp()
  youtubeId: string;

  constructor(duration: number, youtubeId: string, title: string) {
    super();
    this.youtubeId = youtubeId;
    this.duration = duration;
    this.title = title;
  }

  get fileName(): string {
    return `${this.youtubeId}.mp3`;
  }

  get filePath(): string {
    return path.join(appConfig.songs.directory, this.youtubeId + '.mp3');
  }
}
