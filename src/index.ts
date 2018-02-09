import * as express from 'express';
import 'reflect-metadata';
import { SlackController } from './bot/controllers/slack.controller';

const sc = new SlackController();

const app = express();

app.listen(8888, () => console.log('Example app listening on port 3000!'));
