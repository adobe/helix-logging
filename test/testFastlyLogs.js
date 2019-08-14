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
const { makeFormat, makeConfig, updateFastlyConfig } = require('../src/fastly/logs');
const { condit } = require('@adobe/helix-testutils');


describe('Test fastly.logs', () => {
  it('Test makeFormat', () => {
    assert.deepEqual(makeFormat({ foo: 'bar %Y', baz: 'bop %T' }), `{
  "foo": "bar %Y",
  "baz": "bop %T"
}`);
  });

  it('Test makeConfig', () => {
    assert.deepEqual(makeConfig(
      'helix-logs',
      { foo: 'bar %Y', baz: 'bop %T' },
      'new-bar@fakeproject.iam.gserviceaccount.com',
      'fakeproject',
      'helix-logging',
      'requests',
      '%Y%M',
      'BEGIN_KEY\nfakekey\nEND_KEY',
    ),
    {
      dataset: 'helix-logging',
      format: `{
  "foo": "bar %Y",
  "baz": "bop %T"
}`,
      name: 'helix-logs',
      project_id: 'fakeproject',
      table: 'requests',
      template_suffix: '%Y%M',
      secret_key: 'BEGIN_KEY\nfakekey\nEND_KEY',
      user: 'new-bar@fakeproject.iam.gserviceaccount.com',
    });
  });

  condit('Test updateFastlyConfig', condit.hasenvs([
    'HLX_FASTLY_AUTH',
    'GOOGLE_CLIENT_EMAIL',
    'GOOGLE_PROJECT_ID',
    'GOOGLE_PRIVATE_KEY',
    'HLX_FASTLY_NAMESPACE']), async () => {
    try {
      const result = await updateFastlyConfig(
        process.env.HLX_FASTLY_AUTH,
        process.env.HLX_FASTLY_NAMESPACE,
        'helix-logging-test',
        {
          year: 'static',
          month: 'static',
        },
        process.env.GOOGLE_CLIENT_EMAIL,
        process.env.GOOGLE_PROJECT_ID,
        'test_dataset',
        'test_logs',
        '',
        process.env.GOOGLE_PRIVATE_KEY,
      );
      assert.ok(result);
    } catch (e) {
      assert.fail(e);
    }
  }).timeout(10000);
});
