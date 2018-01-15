#!/usr/bin/env node
'use strict';

var program = require('commander');
var currentBranchName = require('git-branch').sync();
var parse = require('parse-git-config');
var config = parse.sync();
var git = parse.keys(config);
var parseUrl = require('git-url-parse');
var opn = require('opn');

var defaults = {
  remote: 'origin',
  base: 'master',
  destination: currentBranchName
};

var getGitUrl = function getGitUrl(url) {
  var _parseUrl = parseUrl(url),
      resource = _parseUrl.resource,
      name = _parseUrl.name,
      owner = _parseUrl.owner;

  return 'https://' + resource + '/' + owner + '/' + name;
};

var getProviderName = function getProviderName(url) {
  return parseUrl(url).source.split('.')[0];
};

var actions = {
  github: function github(url) {
    return {
      pull: function pull(name) {
        return getGitUrl(url) + '/pull/' + name;
      },
      createPull: function createPull(base, destination) {
        return getGitUrl(url) + '/compare/' + base + '...' + destination;
      },
      issues: function issues() {
        return getGitUrl(url) + '/issues';
      },
      issue: function issue(issueNumber) {
        return getGitUrl(url) + '/issues/' + issueNumber;
      },
      createIssue: function createIssue() {
        var title = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var description = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        return getGitUrl(url) + '/issues/new?title=' + title + '&body=' + description;
      }
    };
  },
  gitlab: function gitlab(url) {
    return {
      pull: function pull(name) {
        return getGitUrl(url) + '/merge_requests/' + name;
      },
      createPull: function createPull(base, destination) {
        return getGitUrl(url) + '/merge_requests/new?merge_request[source_branch]=' + base + '&merge_request[target_branch]=' + destination;
      },
      issues: function issues() {
        return getGitUrl(url) + '/issues';
      },
      issue: function issue(issueNumber) {
        return getGitUrl(url) + '/issues/' + issueNumber;
      },
      createIssue: function createIssue() {
        var title = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var description = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        return getGitUrl(url) + '/issues/new?issue[title]=' + title + '&issue[title]=' + description;
      }
    };
  }
};

var openUrl = function openUrl(url) {
  return opn(encodeURI(url), { wait: false });
};

var getAvailableProviders = Object.keys(actions).join(', ');

var noProviderSupportedMessage = function noProviderSupportedMessage() {
  return console.log('gitc does not support your git provider yet. Supported: %s', getAvailableProviders);
};

// Pull Requests
program.command('pull [number]').alias('p').option('-c, --create [branch]', 'The branch you want to open the pull request. The default is your current branch.').option('-b, --base [branch]', 'Your base branch, usally the branch that will receive the changes', defaults.base).option('-r, --remote [remote]', 'Your remote configuration, usally "origin"', defaults.remote).action(function (number, _ref) {
  var remote = _ref.remote,
      create = _ref.create,
      base = _ref.base;

  var url = git.remote[remote].url;
  var provider = actions[getProviderName(url)];

  if (!provider) {
    return noProviderSupportedMessage();
  }

  var _provider = provider(url),
      createPull = _provider.createPull,
      pull = _provider.pull;

  if (create) {
    var shouldUseDefault = typeof create === 'boolean';
    var destination = shouldUseDefault ? defaults.destination : create;

    return openUrl(createPull(base, destination));
  }

  return openUrl(pull(number || defaults.destination));
});

// Issues
program.command('issue [number]').alias('i').option('-c, --create').option('-t, --title [title]', "Your issue's title.", '').option('-b, --body [description]', "Your issue's description.", '').option('-r, --remote [remote]', 'Your remote configuration, usally "origin"', defaults.remote).action(function (number, _ref2) {
  var remote = _ref2.remote,
      create = _ref2.create,
      title = _ref2.title,
      body = _ref2.body;

  var url = git.remote[remote].url;
  var provider = actions[getProviderName(url)];

  if (!provider) {
    return noProviderSupportedMessage();
  }

  var _provider2 = provider(url),
      createPull = _provider2.createPull,
      pull = _provider2.pull,
      createIssue = _provider2.createIssue;

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
