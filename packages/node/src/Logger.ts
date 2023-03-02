export interface UnrevealedLogger {
  info(message: string): void;
  error(message: string): void;
}

export class DefaultLogger implements UnrevealedLogger {
  info(message: string) {
    console.log(`[INFO] unrevealed: ${message}`);
  }

  error(message: string) {
    console.error(`[ERROR] unrevealed: ${message}`);
  }
}
