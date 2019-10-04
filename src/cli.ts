#!/usr/bin/env node
import * as commander from 'commander';
import {slice2md} from './index';
const packageJson = require('../package.json');

function repeatable(value: string, values: string[]) {
  values.push(value);
  return values;
}

const program = commander
  .version(packageJson.version)
  .usage('[options] <file ...>')
  .option(
    '-e, --exclude <file>',
    'File paths or globs to exclude.',
    repeatable,
    [],
  )
  .option('-o, --out-dir <dir>', 'Directory where to put generated files.')
  .parse(process.argv);

slice2md({
  files: program.args,
  exclude: program.exclude,
  outDir: program.outDir,
}).catch(error => {
  console.log(error);
  process.exit(1);
});
