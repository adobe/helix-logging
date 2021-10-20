/*
 * Copyright 2021 Adobe. All rights reserved.
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

const { assert } = require('chai');
const { wrapError } = require('../src/util');

describe('Util Tests', () => {
  const base = new Error('base message');

  it('uses base errors message if none was provided', () => {
    const err = wrapError('', base);
    assert.strictEqual(err.message, base.message);
  });

  it('returns the detail provided', () => {
    const err = wrapError('', base);
    assert.strictEqual(err.detail, base);
  });

  it('does not wrap same type of error if no message was provided', () => {
    const err1 = wrapError('', base);
    const err2 = wrapError('', err1);
    assert.strictEqual(err2, err1);
  });

  it('does wrap same type of error if message was provided', () => {
    const err1 = wrapError('', base);
    const err2 = wrapError('another message', err1);
    assert.notStrictEqual(err2, err1);
  });
});
