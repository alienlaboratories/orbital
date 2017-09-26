//
// Copyright 2017 Alien Labs.
//

// NOTE: Missing deps error if import 'yargs'
// https://github.com/yargs/yargs/issues/781
import yargs from 'yargs/yargs';

yargs()
  .exitProcess(false)
  .parse('');
