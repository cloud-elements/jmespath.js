# jmespath.js

## Install

```console
$ npm install --save @cloud-elements/jmespath
```

## About

jmespath.js is a javascript implementation of JMESPath, which is a query language for JSON. It will
take a JSON document and transform it into another JSON document through a JMESPath expression.

```js
var jmespath = require('jmespath');

jmespath.search({foo: {bar: {baz: [1, 2, 3]}}}, 'foo.bar.baz[2]')
```

> `3`

## Adding custom functions

Custom functions can be added to the JMESPath runtime by using the
`decorate()` function:

```js
function customFunc(resolvedArgs) {
  return resolvedArgs[0] + 99;
}
var extraFunctions = {
  custom: {_func: customFunc, _signature: [{types: [jmespath.types.TYPE_NUMBER]}]},
};
jmespath.decorate(extraFunctions);
```

The value returned by the decorate function is a curried function
(takes arguments one at a time) that takes the search expression 
first and then the data to search against as the second parameter:

```js
var value = jmespath.decorate(extraFunctions)('custom(`1`)')({})
// value = 100
```

Because the return value from `decorate()` is a curried function
the result of compiling the expression can be cached and run 
multiple times against different data:

```js
var expr = jmespath.decorate({})('a');
// expr is now a cached compiled version of the search expression
var value = expr({ a: 1 });
assert.strictEqual(value, 1);
value = expr({ a: 2 });
assert.strictEqual(value, 2);
```
