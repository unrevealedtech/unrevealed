export interface UnrevealedLogger {
  log(message: string): void;
  error(message: string): void;
}

export class DefaultLogger implements UnrevealedLogger {
  log(message: string) {
    console.log(`[INFO] unrevealed: ${message}`);
  }

  error(message: string) {
    console.error(`[ERROR] unrevealed: ${message}`);
  }
}
