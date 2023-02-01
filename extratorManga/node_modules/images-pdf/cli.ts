#!/usr/bin/env node
import chalk from 'chalk';
import program from 'commander';
import { ImagesToPDF } from './index';
import pack from './package.json';

interface Args {
  folder: string;
  output: string;
}

const error = (message: string) => {
  console.log(chalk.red(message));
};

program
  .version(pack.version)
  .option('-f, --folder <path>', 'the folder that contains the images.')
  .option('-o, --output <path>', 'the PDF file to generate.')
  .parse(process.argv);

const args = <Args>(<unknown>program);

if (!args.folder) {
  error('Please enter the folder contains the images.');
} else if (!args.output) {
  error('Please enter thie PDF file to generate.');
}

new ImagesToPDF().convertFolderToPDF(args.folder, args.output);

