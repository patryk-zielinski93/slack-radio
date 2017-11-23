import * as http from 'http';

const app = http.createServer(handler);

if (!module.parent) {
  app.listen(8888);
}

export function helloWorld(): string {
  return 'Hello world!';
}

function handler(req, res) {
  res.writeHead(200);
  res.end(helloWorld());
}

export default helloWorld;
