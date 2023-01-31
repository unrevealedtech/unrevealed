import chalk from 'chalk';

export function logError(...texts: string[]) {
  console.log(
    chalk.bgRed.white.bold(' ERROR '),
    ...texts.map((text) => chalk.red(text)),
  );
}

export function logUnauthorized() {
  logError(
    chalk.red('User not found. Please login to Unrevealed first by running'),
    chalk.red.bold('`unrev login`'),
  );
}
