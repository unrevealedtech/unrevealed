import { Command } from 'commander';
import { version } from '../package.json';
import { generate } from './commands/generate';
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

program
  .command('generate')
  .description('Generate code from your feature flags')
  .action(generate);

program.parse();
