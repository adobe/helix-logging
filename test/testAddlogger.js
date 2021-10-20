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
const { condit } = require('@adobe/helix-testutils');
const addlogger = require('../src/addlogger');

const CI_ENVVAR_NAMES = [
  'GOOGLE_CLIENT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
  'GOOGLE_PROJECT_ID',
  'HLX_FASTLY_NAMESPACE',
  'HLX_FASTLY_AUTH',
  'SPLUNK_HOST',
  'SPLUNK_AUTH',
  'VERSION_NUM'];

describe('Test addlogger', () => {
  condit('Test successful logger setup with Coralogix and Splunk', condit.hasenvs(CI_ENVVAR_NAMES), async () => {
    const res = await addlogger(
      {
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        service: process.env.HLX_FASTLY_NAMESPACE,
        token: process.env.HLX_FASTLY_AUTH,
        project: process.env.GOOGLE_PROJECT_ID,
        splunkhost: process.env.SPLUNK_HOST,
        splunkauth: process.env.SPLUNK_AUTH,
        version: Number.parseInt(process.env.VERSION_NUM, 10),
        coralogixkey: 'fake',
        coralogixapp: 'testing-helix-logging',
      },
      console,
    );
    assert.ok(res);
  }).timeout(60000);

  condit('Test unsuccessful logger setup', condit.hasenvs(CI_ENVVAR_NAMES), async () => {
    try {
      const logger = await addlogger({
        email: 'invalid@foo',
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        service: process.env.HLX_FASTLY_NAMESPACE,
        token: process.env.HLX_FASTLY_AUTH,
        project: process.env.GOOGLE_PROJECT_ID,
        version: Number.parseInt(process.env.VERSION_NUM, 10),
      }, console);
      assert.fail(`${logger} should be undefined`);
    } catch (e) {
      assert.ok(e);
    }
  }).timeout(60000);

  condit('Test zero logger setup', condit.hasenvs(CI_ENVVAR_NAMES), async () => {
    try {
      const logger = await addlogger({
        service: process.env.HLX_FASTLY_NAMESPACE,
        token: process.env.HLX_FASTLY_AUTH,
        project: process.env.GOOGLE_PROJECT_ID,
        version: Number.parseInt(process.env.VERSION_NUM, 10),
      }, console);
      assert.fail(`${logger} should be undefined`);
    } catch (e) {
      assert.ok(e);
    }
  }).timeout(60000);
});
