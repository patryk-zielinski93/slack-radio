import 'reflect-metadata';
import { QueueController } from './bot/controllers/queue.controller';
import { SongService } from './bot/services/song.service';
import { SlackController } from './bot/controllers/slack.controller';

const ss = SongService.getInstance();
ss.getSong('PUdyuKaGQd4').subscribe(song => {
  console.log(song);
  song.save();
}, (err) => {
  console.log(err);
});

const qs = new QueueController('testList');
qs.push('test1');
qs.push('test2');
qs.push('test3');
qs.push('test4');
qs.pop().subscribe(s => {
  console.log(s);
});
qs.pop().subscribe(s => {
  console.log(s);
});
qs.pop().subscribe(s => {
  console.log(s);
});
qs.pop().subscribe(s => {
  console.log(s);
});

const sc = new SlackController();
