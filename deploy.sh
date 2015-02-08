#!/bin/bash

set -o errexit -o nounset

rev=$(git rev-parse --short HEAD)

# Build the Ember app
ember build
cd dist

# Make the Git repo
git init
git config user.name "Alex LaFroscia"
git config user.email "alex@lafroscia.com"

# Push the repo up to Github Pages
git remote add upstream "https://$GH_TOKEN@github.com/rust-lang/rust-by-example.git"
git fetch upstream
git reset upstream/gh-pages

echo "giteasy.alexlafroscia.com" > CNAME

touch .

git add -A .
git commit -m "Rebuild pages at ${rev}"
git push -q upstream HEAD:gh-pages
