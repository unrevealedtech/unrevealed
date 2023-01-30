import appDirs from 'appdirsjs';
import fs from 'fs-extra';
import http from 'http';
import { Socket } from 'net';
import open from 'open';
import ora from 'ora';
import path from 'path';
import url from 'url';

const PORT = 9789;
const HOST = 'http://127.0.0.1';
const REDIRECT_URI = `${HOST}:${PORT}`;
const BASE_APP_URL = process.env.BASE_APP_URL || 'https://app.unrevealed.tech';
const AUTH_URL = `${BASE_APP_URL}/cli/auth/token?redirect_uri=${encodeURIComponent(
  REDIRECT_URI,
)}`;
const SUCCESS_URL = `${BASE_APP_URL}/cli/auth/success`;

const dataDir = appDirs({ appName: 'unrevealed' }).data;

export async function login() {
  const token = await getToken();

  await fs.ensureDir(dataDir);

  await fs.writeFile(
    path.join(dataDir, 'config.json'),
    JSON.stringify({ token }, null, 2),
  );

  console.log('>>> Successfully logged in!');
}

function getToken(): Promise<string> {
  return new Promise((resolve) => {
    const sockets = new Set<Socket>();
    const spinner = ora({
      text: 'Waiting for your authorization',
      spinner: 'bouncingBall',
    });

    const requestListener: http.RequestListener = (req, res) => {
      if (!req.url) {
        res.end();
        return;
      }

      const { query } = url.parse(req.url, true);

      if (typeof query.token !== 'string') {
        res.end();
        return;
      }

      spinner.stop();

      resolve(query.token);

      res.writeHead(302, {
        Location: SUCCESS_URL,
      });

      res.end();

      setImmediate(() => {
        sockets.forEach((socket) => {
          socket.destroy();
          sockets.delete(socket);
        });

        server.close();
      });
    };

    const server = http.createServer(requestListener);

    server.on('connection', (socket) => {
      sockets.add(socket);
      server.once('close', () => {
        sockets.delete(socket);
      });
    });

    server.listen(PORT, () => {
      console.log(`>>> Opening browser to ${AUTH_URL}`);
      spinner.start();

      open(AUTH_URL);
    });
  });
}
