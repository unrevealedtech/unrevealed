import http from 'http';
import open from 'open';
import ora from 'ora';
import url from 'url';
import { writeToken } from '~/auth';
import { BASE_APP_URL } from '~/constants';
import { logInfo, logSuccess } from '~/logger';

const PORT = 9789;
const HOST = 'http://127.0.0.1';
const REDIRECT_URI = `${HOST}:${PORT}`;
const AUTH_URL = `${BASE_APP_URL}/cli/auth/token?redirect_uri=${encodeURIComponent(
  REDIRECT_URI,
)}`;
const SUCCESS_URL = `${BASE_APP_URL}/cli/auth/success`;

export async function login() {
  const token = await getToken();

  await writeToken(token);

  logSuccess('Successfully logged in!');
}

function getToken(): Promise<string> {
  return new Promise((resolve) => {
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

      res.end(() => {
        if (server.closeAllConnections) {
          server.closeAllConnections();
        }

        server.close();
      });
    };

    const server = http.createServer(requestListener);

    server.listen(PORT, () => {
      logInfo(`Opening browser to ${AUTH_URL}`);
      spinner.start();

      open(AUTH_URL);
    });
  });
}
