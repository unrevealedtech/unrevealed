import { Command } from 'commander';
import { version } from '../package.json';
import { link } from './commands/link';
import { login } from './commands/login';

const program = new Command();

program.name('unrev').description('Unrevealed CLI').version(version);

program
  .command('login')
  .description('Login to your Unrevealed account')
  .action(login);

program
  .command('link')
  .description('Link your local directory to an Unrevealed project')
  .action(link);

program.parse();
