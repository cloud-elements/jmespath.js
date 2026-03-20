# jmespath.js

A JavaScript implementation of [JMESPath](https://jmespath.org/), which is a query language for
JSON. It will take a JSON document and transform it into another JSON document through a JMESPath
expression. This fork was originally based from the
[daz-is/jmespath.js](https://github.com/daz-is/jmespath.js) fork, which is highly recommended to
leverage instead of this project. This fork exists for strict compliance, security, and
organizational feature deviation purposes alone.

```js
const jmespath = require('jmespath');

jmespath.search({foo: {bar: {baz: [1, 2, 3]}}}, 'foo.bar.baz[2]')
```

> `3`


## Installation

```console
$ npm install --save @cloudelements/jmespath
```

## Using the `contains` function

The `contains` function checks whether a string or array contains a given value. It accepts two
arguments: the subject (a string or array) and the search value.

**Syntax:** `contains(subject, search)`

### Searching within an array

In JMESPath expressions, literal values are wrapped in backticks (`` ` ``), while string literals
use single quotes (`'`).

```js
const jmespath = require('@cloudelements/jmespath');

// Check if an array contains a number (backticks denote a literal value in JMESPath)
jmespath.search({values: [1, 2, 3]}, 'contains(values, `2`)')
// => true

// Check if an array contains a string
jmespath.search({tags: ['foo', 'bar', 'baz']}, "contains(tags, 'bar')")
// => true

// Returns false when the value is not present
jmespath.search({tags: ['foo', 'bar']}, "contains(tags, 'qux')")
// => false
```

### Searching within a string

```js
// Check if a string contains a substring
jmespath.search({name: 'foobar'}, "contains(name, 'foo')")
// => true

jmespath.search({name: 'foobar'}, "contains(name, 'baz')")
// => false
```

### Case-insensitive search

Pass `{ useCaseInsensitiveComparison: true }` as the third argument to `search` to perform
case-insensitive matching:

```js
const opts = { useCaseInsensitiveComparison: true };

// String comparison ignores case
jmespath.search({name: 'FooBar'}, "contains(name, 'foo')", opts)
// => true

// Array search ignores case
jmespath.search({tags: ['FOO', 'BAR']}, "contains(tags, 'foo')", opts)
// => true
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
