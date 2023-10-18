import appDirs from 'appdirsjs';
import fs from 'fs-extra';
import path from 'path';

const dataDir = appDirs({ appName: 'unrevealed' }).data;
const configFile = path.join(dataDir, 'config.json');

export async function readToken(): Promise<string | null> {
  const token = readTokenFromFile();
  if (token) {
    return token;
  }

  return process.env.UNREVEALED_ACCESS_TOKEN || null;
}

export async function writeToken(token: string) {
  await fs.ensureDir(dataDir);
  await fs.writeJSON(configFile, { token });
}

async function readTokenFromFile(): Promise<string | null> {
  try {
    let { token } = await fs.readJSON(configFile);
    if (typeof token === 'string' && token) {
      return token;
    }
    return null;
  } catch (err) {
    return null;
  }
}
