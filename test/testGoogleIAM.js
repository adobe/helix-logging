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
const { auth } = require('../src/google/auth');
const {
  createServiceAccount, getServiceAccount, createServiceAccountKey, listServiceAccountKeys,
} = require('../src/google/iam');

describe('Test google.iam', () => {
  if (process.env.CLIENT_EMAIL && process.env.PRIVATE_KEY && process.env.PROJECT_ID) {
    it('Test successful service account retrieval', async () => {
      await auth(process.env.CLIENT_EMAIL, process.env.PRIVATE_KEY.replace(/\\n/g, '\n'));
      const account = await getServiceAccount(process.env.PROJECT_ID, 'foo-bar');
      assert.ok(account);
      assert.equal(account.name, `projects/${process.env.PROJECT_ID}/serviceAccounts/foo-bar@${process.env.PROJECT_ID}.iam.gserviceaccount.com`);
    }).timeout(5000);

    it('Test unsuccessful service account retrieval', async () => {
      try {
        await auth(process.env.CLIENT_EMAIL, process.env.PRIVATE_KEY.replace(/\\n/g, '\n'));
        const account = await getServiceAccount(process.env.PROJECT_ID, 'foo-baz');
        assert.fail(`${account} should be undefined`);
      } catch (e) {
        assert.ok(e);
      }
    }).timeout(5000);

    it('Test successful service account creation', async () => {
      await auth(process.env.CLIENT_EMAIL, process.env.PRIVATE_KEY.replace(/\\n/g, '\n'));
      const account = await createServiceAccount(process.env.PROJECT_ID, 'new-bar');
      assert.ok(account);
      assert.equal(account.name, `projects/${process.env.PROJECT_ID}/serviceAccounts/new-bar@${process.env.PROJECT_ID}.iam.gserviceaccount.com`);
    }).timeout(5000);

    it('Test successful service account key creation', async () => {
      await auth(process.env.CLIENT_EMAIL, process.env.PRIVATE_KEY.replace(/\\n/g, '\n'));
      const key = await createServiceAccountKey(process.env.PROJECT_ID, 'new-bar');
      assert.ok(key);
      assert.equal(key.client_email, `new-bar@${process.env.PROJECT_ID}.iam.gserviceaccount.com`);
      assert.equal(key.private_key.split('\n')[0], '-----BEGIN PRIVATE KEY-----');
    }).timeout(10000);

    it('Test unsuccessful service account key creation', async () => {
      try {
        await auth(process.env.CLIENT_EMAIL, process.env.PRIVATE_KEY.replace(/\\n/g, '\n'));
        await createServiceAccountKey('non-existant', 'new-bar');
        assert.fail('This should never happen, because the project does not exist');
      } catch (e) {
        assert.ok(e);
      }
    }).timeout(10000);

    it('Test successful service account key listing', async () => {
      await auth(process.env.CLIENT_EMAIL, process.env.PRIVATE_KEY.replace(/\\n/g, '\n'));
      const keys = await listServiceAccountKeys(process.env.PROJECT_ID, 'new-bar');
      assert.ok(keys);
      assert.ok(Array.isArray(keys));
    }).timeout(10000);

    it('Test unsuccessful service account key listing', async () => {
      try {
        await auth(process.env.CLIENT_EMAIL, process.env.PRIVATE_KEY.replace(/\\n/g, '\n'));
        await listServiceAccountKeys('non-existant', 'new-bar');
        assert.fail('This should never happen, because the project does not exist');
      } catch (e) {
        assert.ok(e);
      }
    }).timeout(10000);
  } else {
    it.skip('Test successful service account retrieval (needs working credentials)');
    it.skip('Test unsuccessful service account retrieval (needs working credentials)');
    it.skip('Test successful service account creation (needs working credentials)');
    it.skip('Test successful service account key creation (needs working credentials)');
  }
});
