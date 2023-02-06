export class Logger {
  log(message: string) {
    console.log(`[INFO] unrevealed: ${message}`);
  }

  error(message: string) {
    console.log(`[ERROR] unrevealed: ${message}`);
  }
}
