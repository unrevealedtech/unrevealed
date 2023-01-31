import appDirs from 'appdirsjs';
import fs from 'fs-extra';
import path from 'path';

const dataDir = appDirs({ appName: 'unrevealed' }).data;
const configFile = path.join(dataDir, 'config.json');

export async function readToken(): Promise<string | null> {
  try {
    const { token } = await fs.readJSON(configFile);
    if (typeof token !== 'string') {
      return null;
    }
    return token;
  } catch (err) {
    return null;
  }
}

export async function writeToken(token: string) {
  await fs.ensureDir(dataDir);
  await fs.writeJSON(configFile, { token });
}
