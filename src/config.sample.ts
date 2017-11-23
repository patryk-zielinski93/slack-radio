import * as path from 'path';

export const appConfig = {
  youtube: {
    apiKey: 'xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  },
  slack: {
    token: 'xoxb-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx'
  },
  db: {
    connection: {
      database: 'slack-radio',
      host: '126.126.1.2',
      port: 27017,
      password: '',
      username: '',
      options: ''
    }
  },
  songs: {
    directory: path.join(__dirname, 'public', 'songs'),
    normalizationDb: 97
  }
};
