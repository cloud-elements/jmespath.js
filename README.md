# jmespath.js

A JavaScript implementation of JMESPath, which is a query language for JSON. It will take a JSON
document and transform it into another JSON document through a JMESPath expression. This fork was
originally based from the [daz-is/jmespath.js](https://github.com/daz-is/jmespath.js) fork, which
is highly recommended to leverage instead of this project. This fork exists for strict compliance,
security, and organizational feature deviation purposes alone.

```js
const jmespath = require('jmespath');

jmespath.search({foo: {bar: {baz: [1, 2, 3]}}}, 'foo.bar.baz[2]')
```

> `3`


## Installation

```console
$ npm install --save @cloudelements/jmespath
```

## Adding custom functions

Custom functions can be added to the JMESPath runtime by using the `decorate` function:

```js
function customFunc(resolvedArgs) {
  return resolvedArgs[0] + 99;
}

const extraFunctions = {
  custom: {_func: customFunc, _signature: [{types: [jmespath.types.TYPE_NUMBER]}]},
};

jmespath.decorate(extraFunctions);
```

The value returned by the decorate function is a curried function (takes arguments one at a time)
that takes the search expression first and then the data to search against as the second parameter:

```js
jmespath.decorate(extraFunctions)('custom(`1`)')({})
```

> `100`

Because the return value from `decorate` is a curried function the result of compiling the
expression can be cached and run multiple times against different data:

```js
const expr = jmespath.decorate({})('a');
let value;

value = expr({a: 1});
assert.strictEqual(value, 1);

value = expr({a: 2});
assert.strictEqual(value, 2);
```
