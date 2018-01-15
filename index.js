#!/usr/bin/env node

const program = require('commander');
const branch = require('git-branch').sync();
const parse = require('parse-git-config');
const config = parse.sync();
const git = parse.keys(config);
const { exec } = require('child_process');

const defaults = {
    remote: 'origin',
    master: 'master',
};

// Open the pull request web page
// see
program
    .command('see')
    .action(() => {
        exec(`open ${git.remote[defaults.remote].url}/pulls/${branch}`);
    });

// Open a pull request
program
    .command('open')
    .alias('create')
    .action(() => {
        exec(`open ${git.remote[defaults.remote].url}/compare/${defaults.master}...${branch}`);
    });

program.parse(process.argv);
