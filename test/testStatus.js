/*
 * Copyright 2018 Adobe. All rights reserved.
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
const nock = require('nock');
const status = require('../src/status');

describe('Test status', () => {
  it('Returns XML', async () => {
    assert.equal((await status()).body.indexOf('<'), 0);
  }).timeout(5000);

  it('Returns XML with statusCode 503 for network errors', async () => {
    nock.disableNetConnect();
    try {
      const { statusCode, headers, body } = await status();
      assert.equal(statusCode, 503);
      assert.equal(headers['Content-Type'], 'application/xml');
      assert.equal(body.indexOf('<'), 0);
    } finally {
      // reset nock
      nock.cleanAll();
      nock.enableNetConnect();
    }
  });
});
