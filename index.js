#!/usr/bin/env node

'use strict';

const program = require('commander');
const currentBranchName = require('git-branch').sync();
const parse = require('parse-git-config');
const config = parse.sync();
const git = parse.keys(config);
const parseUrl = require('git-url-parse');
const opn = require('opn');

const defaults = {
  remote: 'origin',
  base: 'master',
  destination: currentBranchName,
};

const getGitUrl = url => {
  const { resource, name, owner } = parseUrl(url);

  return `https://${resource}/${owner}/${name}`;
};

const getProviderName = url => parseUrl(url).source.split('.')[0];

const actions = {
  github: url => ({
    pull: name =>
      `${getGitUrl(url)}/pull/${name}`,
    createPull: (base, destination) =>
      `${getGitUrl(url)}/compare/${base}...${destination}`,
    issues: () =>
      `${getGitUrl(url)}/issues`,
    issue: issueNumber =>
      `${getGitUrl(url)}/issues/${issueNumber}`,
    createIssue: (title = '', description = '') =>
      `${getGitUrl(url)}/issues/new?title=${title}&body=${description}`,
  }),
  gitlab: url => ({
    pull: name =>
      `${getGitUrl(url)}/merge_requests/${name}`,
    createPull: (base, destination) =>
      `${getGitUrl(url)}/merge_requests/new?merge_request[source_branch]=${base}&merge_request[target_branch]=${destination}`,
    issues: () =>
      `${getGitUrl(url)}/issues`,
    issue: issueNumber =>
      `${getGitUrl(url)}/issues/${issueNumber}`,
    createIssue: (title = '', description = '') =>
      `${getGitUrl(url)}/issues/new?issue[title]=${title}&issue[title]=${description}`,
  }),
};

const openUrl = url => opn(encodeURI(url), { wait: false });

const getAvailableProviders = Object.keys(actions).join(', ');

const noProviderSupportedMessage = () => console.log(
  'gitc does not support your git provider yet. Supported: %s',
  getAvailableProviders,
);

// Pull Requests
program
  .command('pull [number]')
  .alias('p')
  .option('-c, --create [branch]', 'The branch you want to open the pull request. The default is your current branch.')
  .option(
    '-b, --base [branch]',
    'Your base branch, usally the branch that will receive the changes',
    defaults.base,
  )
  .option(
    '-r, --remote [remote]',
    'Your remote configuration, usally "origin"',
    defaults.remote,
  )
  .action((number, { remote, create, base }) => {
    const url = git.remote[remote].url;
    const provider = actions[getProviderName(url)];

    if (!provider) {
      return noProviderSupportedMessage();
    }

    const { createPull, pull } = provider(url);

    if (create) {
      const shouldUseDefault = typeof create === 'boolean';
      const destination = shouldUseDefault ? defaults.destination : create;

      return openUrl(createPull(base, destination));
    }

    return openUrl(pull(number || defaults.destination));
  });

// Issues
program
  .command('issue [number]')
  .alias('i')
  .option('-c, --create')
  .option('-t, --title [title]', "Your issue's title.", '')
  .option('-b, --body [description]', "Your issue's description.", '')
  .option(
    '-r, --remote [remote]',
    'Your remote configuration, usally "origin"',
    defaults.remote,
  )
  .action((number, { remote, create, title, body }) => {
    const url = git.remote[remote].url;
    const provider = actions[getProviderName(url)];

    if (!provider) {
      return noProviderSupportedMessage();
    }

    const { createPull, pull, createIssue } = provider(url);

    if (create) {
      return openUrl(createIssue(title, body));
    }

    if (!number) {
      return openUrl(issues());
    }

    return openUrl(issue(number));
  });

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse(process.argv);
