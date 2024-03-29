var assert = require('assert');
var jmespath = require('../src/jmespath');
var tokenize = jmespath.tokenize;
var compile = jmespath.compile;
var strictDeepEqual = jmespath.strictDeepEqual;


describe('tokenize', function() {
    it('should tokenize unquoted identifier', function() {
        assert.deepEqual(tokenize('foo'),
                         [{type: "UnquotedIdentifier",
                          value: "foo",
                          start: 0}]);
    });
    it('should tokenize unquoted identifier with underscore', function() {
        assert.deepEqual(tokenize('_underscore'),
                          [{type: "UnquotedIdentifier",
                           value: "_underscore",
                           start: 0}]);
    });
    it('should tokenize unquoted identifier with numbers', function() {
        assert.deepEqual(tokenize('foo123'),
                          [{type: "UnquotedIdentifier",
                           value: "foo123",
                           start: 0}]);
    });
    it('should tokenize dotted lookups', function() {
        assert.deepEqual(
            tokenize('foo.bar'),
            [{type: "UnquotedIdentifier", value: "foo", start: 0},
             {type: "Dot", value: ".", start: 3},
             {type: "UnquotedIdentifier", value: "bar", start: 4},
            ]);
    });
    it('should tokenize numbers', function() {
        assert.deepEqual(
            tokenize('foo[0]'),
            [{type: "UnquotedIdentifier", value: "foo", start: 0},
             {type: "Lbracket", value: "[", start: 3},
             {type: "Number", value: 0, start: 4},
             {type: "Rbracket", value: "]", start: 5},
            ]);
    });
    it('should tokenize numbers with multiple digits', function() {
        assert.deepEqual(
            tokenize("12345"),
            [{type: "Number", value: 12345, start: 0}]);
    });
    it('should tokenize negative numbers', function() {
        assert.deepEqual(
            tokenize("-12345"),
            [{type: "Number", value: -12345, start: 0}]);
    });
    it('should tokenize quoted identifier', function() {
        assert.deepEqual(tokenize('"foo"'),
                         [{type: "QuotedIdentifier",
                          value: "foo",
                          start: 0}]);
    });
    it('should tokenize quoted identifier with unicode escape', function() {
        assert.deepEqual(tokenize('"\\u2713"'),
                         [{type: "QuotedIdentifier",
                          value: "✓",
                          start: 0}]);
    });
    it('should tokenize literal lists', function() {
        assert.deepEqual(tokenize("`[0, 1]`"),
                         [{type: "Literal",
                          value: [0, 1],
                          start: 0}]);
    });
    it('should tokenize literal dict', function() {
        assert.deepEqual(tokenize("`{\"foo\": \"bar\"}`"),
                         [{type: "Literal",
                          value: {"foo": "bar"},
                          start: 0}]);
    });
    it('should tokenize literal strings', function() {
        assert.deepEqual(tokenize("`\"foo\"`"),
                         [{type: "Literal",
                          value: "foo",
                          start: 0}]);
    });
    it('should tokenize json literals', function() {
        assert.deepEqual(tokenize("`true`"),
                         [{type: "Literal",
                          value: true,
                          start: 0}]);
    });
    it('should not requiring surrounding quotes for strings', function() {
        assert.deepEqual(tokenize("`foo`"),
                         [{type: "Literal",
                          value: "foo",
                          start: 0}]);
    });
    it('should not requiring surrounding quotes for numbers', function() {
        assert.deepEqual(tokenize("`20`"),
                         [{type: "Literal",
                           value: 20,
                           start: 0}]);
    });
    it('should tokenize literal lists with chars afterwards', function() {
        assert.deepEqual(
            tokenize("`[0, 1]`[0]"), [
                {type: "Literal", value: [0, 1], start: 0},
                {type: "Lbracket", value: "[", start: 8},
                {type: "Number", value: 0, start: 9},
                {type: "Rbracket", value: "]", start: 10}
        ]);
    });
    it('should tokenize two char tokens with shared prefix', function() {
        assert.deepEqual(
            tokenize("[?foo]"),
            [{type: "Filter", value: "[?", start: 0},
             {type: "UnquotedIdentifier", value: "foo", start: 2},
             {type: "Rbracket", value: "]", start: 5}]
        );
    });
    it('should tokenize flatten operator', function() {
        assert.deepEqual(
            tokenize("[]"),
            [{type: "Flatten", value: "[]", start: 0}]);
    });
    it('should tokenize comparators', function() {
        assert.deepEqual(tokenize("<"),
                         [{type: "LT",
                          value: "<",
                          start: 0}]);
    });
    it('should tokenize two char tokens without shared prefix', function() {
        assert.deepEqual(
            tokenize("=="),
            [{type: "EQ", value: "==", start: 0}]
        );
    });
    it('should tokenize not equals', function() {
        assert.deepEqual(
            tokenize("!="),
            [{type: "NE", value: "!=", start: 0}]
        );
    });
    it('should tokenize the OR token', function() {
        assert.deepEqual(
            tokenize("a||b"),
            [
                {type: "UnquotedIdentifier", value: "a", start: 0},
                {type: "Or", value: "||", start: 1},
                {type: "UnquotedIdentifier", value: "b", start: 3}
            ]
        );
    });
    it('should tokenize function calls', function() {
        assert.deepEqual(
            tokenize("abs(@)"),
            [
                {type: "UnquotedIdentifier", value: "abs", start: 0},
                {type: "Lparen", value: "(", start: 3},
                {type: "Current", value: "@", start: 4},
                {type: "Rparen", value: ")", start: 5}
            ]
        );
    });

});


describe('parsing', function() {
    it('should parse field node', function() {
        assert.deepEqual(compile('foo'),
                          {type: 'Field', name: 'foo'});
    });
});

describe('strictDeepEqual', function() {
    it('should compare scalars', function() {
        assert.strictEqual(strictDeepEqual('a', 'a'), true);
    });
    it('should be false for different types', function() {
        assert.strictEqual(strictDeepEqual('a', 2), false);
    });
    it('should be false for arrays of different lengths', function() {
        assert.strictEqual(strictDeepEqual([0, 1], [1, 2, 3]), false);
    });
    it('should be true for identical arrays', function() {
        assert.strictEqual(strictDeepEqual([0, 1], [0, 1]), true);
    });
    it('should be true for nested arrays', function() {
        assert.strictEqual(
            strictDeepEqual([[0, 1], [2, 3]], [[0, 1], [2, 3]]), true);
    });
    it('should be true for nested arrays of strings', function() {
        assert.strictEqual(
            strictDeepEqual([["a", "b"], ["c", "d"]],
                            [["a", "b"], ["c", "d"]]), true);
    });
    it('should be false for different arrays of the same length', function() {
        assert.strictEqual(strictDeepEqual([0, 1], [1, 2]), false);
    });
    it('should handle object literals', function() {
        assert.strictEqual(strictDeepEqual({a: 1, b: 2}, {a: 1, b: 2}), true);
    });
    it('should handle keys in first not in second', function() {
        assert.strictEqual(strictDeepEqual({a: 1, b: 2}, {a: 1}), false);
    });
    it('should handle keys in second not in first', function() {
        assert.strictEqual(strictDeepEqual({a: 1}, {a: 1, b: 2}), false);
    });
    it('should handle nested objects', function() {
        assert.strictEqual(
            strictDeepEqual({a: {b: [1, 2]}},
                            {a: {b: [1, 2]}}), true);
    });
    it('should handle nested objects that are not equal', function() {
        assert.strictEqual(
            strictDeepEqual({a: {b: [1, 2]}},
                            {a: {b: [1, 4]}}), false);
    });
});

describe('search', function() {
    it('should by default support case sensitive comparison via compatators', function() {
        assert.equal(jmespath.search({foo: 'bar'}, "foo == 'BAR'"), false);
        assert.equal(jmespath.search({foo: 'BAR'}, "foo == 'bar'"), false);
        assert.equal(jmespath.search({foo: 'bar'}, 'contains(`["BAR"]`, foo)'), false);
        assert.equal(jmespath.search({foo: 'bar'}, '`{"bar": "baz", "qux": 2}`.bar == \'BAZ\''), false);
        assert.equal(jmespath.search({foo: 'bar'}, "foo != 'BAR'"), true);
        assert.equal(jmespath.search({foo: 'BAR'}, "foo != 'bar'"), true);
        assert.equal(jmespath.search({foo: 2}, 'contains(`[1, 2, 3]`, foo)'), true);
        assert.equal(jmespath.search({foo: 2}, '`{"bar": 2}`.bar == foo'), true);
    });
    it('should support case insensitive comparison via compatators', function() {
        var opts = { useCaseInsensitiveComparison: true };
        assert.equal(jmespath.search({foo: 'bar'}, "foo == 'BAR'", opts), true);
        assert.equal(jmespath.search({foo: 'BAR'}, "foo == 'bar'", opts), true);
        assert.equal(jmespath.search({foo: 'bar'}, 'contains(`["BAR"]`, foo)', opts), true);
        assert.equal(jmespath.search({foo: 'bar'}, '`{"bar": "baz", "qux": 2}`.bar == \'BAZ\'', opts), true);
        assert.equal(jmespath.search({foo: 'bar'}, "foo != 'BAR'", opts), false);
        assert.equal(jmespath.search({foo: 'BAR'}, "foo != 'bar'", opts), false);
        assert.equal(jmespath.search({foo: 2}, 'contains(`[1, 2, 3]`, foo)', opts), true);
        assert.equal(jmespath.search({foo: 2}, '`{"bar": 2}`.bar == foo', opts), true);
    });
    it('should by default support case sensitive comparison via functions', function() {
        assert.equal(jmespath.search({foo: 'bar'}, "starts_with(foo, 'B')"), false);
        assert.equal(jmespath.search({foo: 'bar'}, "ends_with(foo, 'AR')"), false);
    });
    it('should support case insensitive comparison via functions', function() {
        var opts = { useCaseInsensitiveComparison: true };
        assert.equal(jmespath.search({foo: 'bar'}, "starts_with(foo, 'B')", opts), true);
        assert.equal(jmespath.search({foo: 'bar'}, "ends_with(foo, 'AR')", opts), true);
    });
    it(
        'should throw a readable error when invalid arguments are provided to a function',
        function() {
            try {
                jmespath.search([], 'length(`null`)');
            } catch (e) {
                assert(e.message.search(
                    'expected argument 1 to be type string,array,object'
                ), e.message);
                assert(e.message.search('received type null'), e.message);
            }
        }
    );
});

describe('over', function() {
  it('should mutate objects', function() {
    assert.deepStrictEqual(
      jmespath.over({a: 1, b: 2}, 'a', (a) => a.toString()),
      {a: '1', b: 2}
    );
    assert.deepStrictEqual(
      jmespath.over({a: {b: {c: {d: 1}}}, e: 2}, 'a.b.c.d', (a) => a.toString()),
      {a: {b: {c: {d: '1'}}}, e: 2}
    );
  });

  it('should mutate arrays', function() {
    assert.deepStrictEqual(
      jmespath.over({a: [1, 2, 3]}, 'a | [0]', (a) => a.toString()),
      {a: ['1', 2, 3]}
    );
  });

  it('should mutate slices', function() {
    assert.deepStrictEqual(
      jmespath.over({a: [1, 2, 3]}, 'a[0:3]', (a) => a.toString()),
      {a: ['1', '2', '3']}
    );
  });
});

describe('remove', function() {
    it('should remove a basic traversal', function() {
        let testData = {
            a: {
                "b": {
                    "c": [1, 2, 3]
                }
            }
        }
        assert.deepStrictEqual(
            jmespath.remove(testData, 'a.b.c', (a) => a.toString()),
            {a: {b: {}}}
        );
    });

    it('should remove a nested list traversal', function() {
        let testData = {
            a: [
                {
                    "b": {
                        "c": [1, 2, 3]
                    }
                }
            ]
        }
        assert.deepStrictEqual(
            jmespath.remove(testData, 'a[0].b.c', (a) => a.toString()),
            {a: [{b: {}}]}
        );
    });
    it('should NOT remove a nested list', function() {
        let testData = {
            a: [
                {
                    "b": {
                        "c": [[1,2,3], 2, 3]
                    }
                }
            ]
        }
        assert.deepStrictEqual(
            jmespath.remove(testData, 'a[0].b.c[0]', (a) => a.toString()),
            {a: [{b: {"c": [[1,2,3], 2, 3]}}]}
        );
    });
    it('should NOT remove a flatten', function() {
        let testData = {
            a: [
                [{"a": "b"}],
                "c"
            ]
        }
        assert.deepStrictEqual(
            jmespath.remove(testData, 'a[]', (a) => a.toString()),
            {a:[[{"a":"b"}], "c"]}
        );
    });
    it('should NOT remove a flatten index', function() {
        let testData = {
            a: [
                [{"a": "b"}],
                "c"
            ]
        }
        assert.deepStrictEqual(
            jmespath.remove(testData, 'a[][0]', (a) => a.toString()),
            {a:[[{"a":"b"}], "c"]}
        );
    });
    it('should NOT remove a flatten slice', function() {
        let testData = {
            a: [
                [{"a": "b"}],
                "c"
            ]
        }
        assert.deepStrictEqual(
            jmespath.remove(testData, 'a[][0:]', (a) => a.toString()),
            {a:[[{"a":"b"}], "c"]}
        );
    });
});

describe('decorate', function() {
  it(
    'should call a custom function when called via decorator',
    function() {
      var TYPE_NUMBER = 0;
      function customFunc(resolvedArgs) {
        return resolvedArgs[0] + 99;
      }
      var extraFunctions = {
        custom: {_func: customFunc, _signature: [{types: [TYPE_NUMBER]}]},
      };
      var value = jmespath.decorate(extraFunctions)('custom(`1`)')({});
      assert.strictEqual(value, 100);
    }
  );
  it(
    'should provide a compiled expression that can be cached and reused',
    function() {
      var expr = jmespath.decorate({})('a');
      var value = expr({ a: 1 });
      assert.strictEqual(value, 1);
      value = expr({ a: 2 });
      assert.strictEqual(value, 2);
    }
  );
});

describe('root', function() {
  it(
    '$ should give access to the root value',
    function() {
      var value = jmespath.search({ foo: { bar: 1 }}, 'foo.{ value: $.foo.bar }');
      assert.equal(value.value, 1);
    }
  );
  it(
    '$ should give access to the root value after pipe',
    function() {
      var value = jmespath.search({ foo: { bar: 1 }}, 'foo | $.foo.bar');
      assert.strictEqual(value, 1);
    }
  );
});
