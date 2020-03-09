# Release

## Increment version

Increment the version in `package.json` and `package-lock.json` following semver rules, guided by
the Conventional Commits contained within.

## Generate changelog

```console
$ npm run changelog
...
```

## Commit to git

```console
$ git add -A
...
$ git commit -m "chore(release): cut version X.Y.Z"
...
$ git push origin master
...
```

## Create git tag

```console
$ git tag -a vX.Y.Z -m "chore(release): cut version X.Y.Z"
...
$ git push --tags
...
```

## Publish to NPM

```console
$ npm publish
...
```
