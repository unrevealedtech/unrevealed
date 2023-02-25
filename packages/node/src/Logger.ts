export interface Logger {
  log(message: string): void;
  error(message: string): void;
}

export class UnrevealedLogger implements Logger {
  log(message: string) {
    console.log(`[INFO] unrevealed: ${message}`);
  }

  error(message: string) {
    console.error(`[ERROR] unrevealed: ${message}`);
  }
}
