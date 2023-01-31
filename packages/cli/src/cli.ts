import { Command } from 'commander';
import { version } from '../package.json';
import { init } from './commands/init';
import { login } from './commands/login';

const program = new Command();

program.name('unrev').description('Unrevealed CLI').version(version);

program
  .command('login')
  .description('Login to your Unrevealed account')
  .action(login);

program
  .command('init')
  .description('Link your local directory to an Unrevealed project')
  .action(init);

program.parse();
