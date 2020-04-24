/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-env mocha */
const assert = require('assert');
const {
  toString, vcl, time, req, res, str, concat,
} = require('../src/util/schemahelper');
const bigschema = require('../src/coralogix/schema');

describe('Schema Helper Integration Tests', () => {
  it('toString works with empty schemas', () => {
    assert.equal(toString({}), '{}');
  });

  it('toString works with simple schemas', () => {
    assert.equal(toString({
      foo: '%D',
    }), '{"foo": %D}');
  });

  it('toString works with simple schemas', () => {
    assert.equal(toString({
      foo: '%D',
    }), '{"foo": %D}');
  });

  it('toString works with nested schemas and VCL encoding', () => {
    assert.equal(toString({
      foo: {
        bar: vcl`client.as.number`,
        baz: str(vcl`req.http.X-CDN-Request-ID`),
      },
    }), '{"foo": {"bar": %{client.as.number}V, "baz": "%{req.http.X-CDN-Request-ID}V"}}');
  });

  it('toString works with nested schemas and more VCL encoding', () => {
    assert.equal(toString({
      foo: {
        bar: vcl`client.as.number`,
        baz: str(vcl`req.http.X-CDN-Request-ID`),
        method: str('%m'),
        referer: req`Referer`,
        age: res`Age`,
        end: str(
          concat(
            time`end:%Y-%m-%dT%H:%M:%S`,
            '.',
            time`end:msec_frac`,
            time`end:%z`,
          ),
        ),
      },
    }), '{"foo": {"bar": %{client.as.number}V, "baz": "%{req.http.X-CDN-Request-ID}V", "method": "%m", "referer": "%{Referer}i", "age": "%{Age}o", "end": "%{end:%Y-%m-%dT%H:%M:%S}t.%{end:msec_frac}t%{end:%z}t"}}');
  });

  it('Spot check the big schema', () => {
    const result = toString(bigschema);

    assert.equal(result.match(/\(/g).length, result.match(/\)/g).length, '() do not match');
    assert.equal(result.match(/\{/g).length, result.match(/\}/g).length, '{} do not match');
    assert.ok(result.match(/"/g).length % 2 === 0, 'unbalanced "');
    // assert.ok(result.match(/'/g).length % 2 === 0, 'unbalanced \'');
  });
});
