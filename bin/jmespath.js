#!/usr/bin/env node

const jmespath = require('../src/jmespath');

process.stdin.setEncoding('utf-8');

if (process.argv.length < 2) {
  console.error("Must provide a JMESPath expression.");
  process.exit(1);
}

let inputJSON = "";

process.stdin.on('readable', function() {
  let chunk = process.stdin.read();

  if (chunk !== null) {
    inputJSON += chunk;
  }
});

process.stdin.on('end', function() {
  let parsedInput = JSON.parse(inputJSON);

  console.log(JSON.stringify(jmespath.search(parsedInput, process.argv[2])));
});
