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

const assert = require('assert');
const proxyquire = require('proxyquire');
const { Request, Response } = require('@adobe/helix-fetch');
const { wrapError } = require('../src/util');

const { main } = require('../src/index');

describe('Index Tests', () => {
  it('returns 400 for missing body', async () => {
    const result = await main(new Request('https://helix-service.com/logging'), { log: console });
    assert.strictEqual(result.status, 400);
  });
  it('returns 400 for malformed JSON', async () => {
    const result = await main(new Request('https://helix-service.com/logging', {
      method: 'POST', body: '<',
    }), { log: console });
    assert.strictEqual(result.status, 400);
  });
  it('returns 401 for bad credentials (form-based submit)', async () => {
    const { main: proxy } = proxyquire('../src/index.js', {
      './addlogger': () => {
        throw wrapError('Bad credentials', { code: 401 });
      },
    });
    const result = await proxy(new Request('https://helix-service.com/logging', {
      method: 'POST',
      body: { foo: 'bar' },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    }), {
      log: console,
      env: {},
    });
    assert.strictEqual(result.status, 401);
  });

  it('returns 401 for bad credentials (JSON-based submit)', async () => {
    const { main: proxy } = proxyquire('../src/index.js', {
      './addlogger': () => {
        throw wrapError('Bad credentials', { code: 401 });
      },
    });
    const result = await proxy(new Request('https://helix-service.com/logging', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'content-type': 'application/json',
      },
    }), {
      log: console,
      env: {},
    });
    assert.strictEqual(result.status, 401);
  });

  it('returns 200 when addLogger succeeds', async () => {
    const { main: proxy } = proxyquire('../src/index.js', {
      './addlogger': () => new Response(200),
    });
    const result = await proxy(new Request('https://helix-service.com/logging', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'content-type': 'application/json',
      },
    }), {
      log: console,
      env: {},
    });
    assert.strictEqual(result.status, 200);
  });

  it('returns 500 when something unexpected happens', async () => {
    const { main: proxy } = proxyquire('../src/index.js', {
      './addlogger': () => {
        throw new Error('Where did that come from?');
      },
    });
    const result = await proxy(new Request('https://helix-service.com/logging', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'content-type': 'application/json',
      },
    }), {
      log: console,
      env: {},
    });
    assert.strictEqual(result.status, 500);
  });
});
