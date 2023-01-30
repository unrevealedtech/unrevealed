import { Command } from 'commander';
import { version } from '../package.json';
import { login } from './login';

const program = new Command();

program.name('unrev').description('Unrevealed CLI').version(version);

program
  .command('login')
  .description('Login to your Unrevealed account')
  .action(login);

program.parse();
