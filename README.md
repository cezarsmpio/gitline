# gitline

> A simple command-line tool to create issues and pull requests easily.

### Support:

Providers:

* Github
* Gitlab

OS:

* Linux
* macOS
* Windows

Node version:

* \>= 4

### Install

```
yarn add gitline --global
```

```
npm install --global gitline
```

### Examples

#### Pull Requests

Go to your current branch's PR

```
$ gitline pull
```

Create a new pull request using your current branch and master

```
$ gitline pull --create
$ gitline pull -c
```

Create a new pull request using a different base branch

```
$ gitline pull -c --base production
```

Go to a specific pull request:

```
$ gitline pull 123
```

#### Issues

Read the issues:

```
$ gitline issue
```

Go to a specific issue:

```
$ gitline issue 123
$ gitline i 123
```

Create an issue:
```
$ gitline i -c

$ gitline issue -c -t Your title here -b Your description
```

#### Remote

If you want to use a different remote, usually "origin", you can pass the `-r` or `--remote` option:

```
$ gitline pull --create --remote my-other-remote
```

`gitline` uses your `.git/config` file to read your project's git configuration.


### Help

```
$ gitline --help


  Usage: gitline [options] [command]


  Options:

    -h, --help  output usage information


  Commands:

    pull|p [options] [number]
    issue|i [options] [number]
```

```
$ gitline pull --help

  Usage: pull|p [options] [number]


  Options:

    -c, --create [branch]  Branch you want to open the pull request
    -b, --base [branch]    Your base branch, usally the branch that will receive the changes (default: master)
    -r, --remote [remote]  Your remote configuration, usally "origin" (default: origin)
    -h, --help             output usage information
```

```
$ gitline issue --help

  Usage: issue|i [options] [number]


  Options:

    -c, --create
    -t, --title [title]       Your issue's title. (default: )
    -b, --body [description]  Your issue's description. (default: )
    -r, --remote [remote]     Your remote configuration, usally "origin" (default: origin)
    -h, --help                output usage information
```

---

Enjoy!
