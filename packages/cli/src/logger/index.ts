import chalk from 'chalk';

export function logError(...messages: string[]) {
  console.error(chalk.bgRed.white.bold(' ERROR '), chalk.red(messages));
}

export function logSuccess(...messages: string[]) {
  console.log(chalk.green('>>>', ...messages));
}

export function logInfo(...messages: string[]) {
  console.log('>>>', ...messages);
}

export function logUnauthorized() {
  logError(
    chalk.red('User not found. Please login to Unrevealed first by running'),
    chalk.red.bold('`unrev login`'),
  );
}
