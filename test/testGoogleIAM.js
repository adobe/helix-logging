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
  createServiceAccount,
  getServiceAccount,
  createServiceAccountKey,
  listServiceAccountKeys,
  deleteServiceAccountKey,
  getIamPolicy,
  addIamPolicy,
} = require('../src/google/iam');
const condit = require('./condit');

const GOOGLE_CI_ENV_NAMES = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_PROJECT_ID'];

describe('Test google.iam', () => {
  condit('Test successful service account retrieval', condit.hasenvs(GOOGLE_CI_ENV_NAMES), async () => {
    await auth(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));
    const account = await getServiceAccount(process.env.GOOGLE_PROJECT_ID, 'foo-bar');
    assert.ok(account);
    assert.equal(account.name, `projects/${process.env.GOOGLE_PROJECT_ID}/serviceAccounts/foo-bar@${process.env.GOOGLE_PROJECT_ID}.iam.gserviceaccount.com`);
  }).timeout(5000);

  condit('Test unsuccessful service account retrieval', condit.hasenvs(GOOGLE_CI_ENV_NAMES), async () => {
    try {
      await auth(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));
      const account = await getServiceAccount(process.env.GOOGLE_PROJECT_ID, 'foo-baz');
      assert.fail(`${account} should be undefined`);
    } catch (e) {
      assert.ok(e);
    }
  }).timeout(5000);

  condit('Test successful service account creation', condit.hasenvs(GOOGLE_CI_ENV_NAMES), async () => {
    await auth(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));
    const account = await createServiceAccount(process.env.GOOGLE_PROJECT_ID, 'new-bar');
    assert.ok(account);
    assert.equal(account.name, `projects/${process.env.GOOGLE_PROJECT_ID}/serviceAccounts/new-bar@${process.env.GOOGLE_PROJECT_ID}.iam.gserviceaccount.com`);
  }).timeout(5000);

  condit('Test successful service account key creation', condit.hasenvs(GOOGLE_CI_ENV_NAMES), async () => {
    await auth(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));
    const key = await createServiceAccountKey(process.env.GOOGLE_PROJECT_ID, 'new-bar');
    assert.ok(key);
    assert.equal(key.client_email, `new-bar@${process.env.GOOGLE_PROJECT_ID}.iam.gserviceaccount.com`);
    assert.equal(key.private_key.split('\n')[0], '-----BEGIN PRIVATE KEY-----');
  }).timeout(100000);

  condit('Test successful service account key creation with resource exhaustion', condit.hasenvs(GOOGLE_CI_ENV_NAMES), async () => {
    await auth(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));

    // there is a limit of ten keys per account. Creating 12 will exceed the limit.
    for (let i = 0; i < 12; i += 1) {
      /* eslint-disable-next-line no-await-in-loop */
      const key = await createServiceAccountKey(process.env.GOOGLE_PROJECT_ID, 'new-bar');
      assert.ok(key);
      assert.equal(key.client_email, `new-bar@${process.env.GOOGLE_PROJECT_ID}.iam.gserviceaccount.com`);
      assert.equal(key.private_key.split('\n')[0], '-----BEGIN PRIVATE KEY-----');
    }
  }).timeout(100000);

  condit('Test unsuccessful service account key creation', condit.hasenvs(GOOGLE_CI_ENV_NAMES), async () => {
    try {
      await auth(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));
      await createServiceAccountKey('non-existant', 'new-bar');
      assert.fail('This should never happen, because the project does not exist');
    } catch (e) {
      assert.ok(e);
    }
  }).timeout(10000);

  condit('Test successful service account key listing', condit.hasenvs(GOOGLE_CI_ENV_NAMES), async () => {
    await auth(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));
    const keys = await listServiceAccountKeys(process.env.GOOGLE_PROJECT_ID, 'new-bar');
    assert.ok(keys);
    assert.ok(Array.isArray(keys));
  }).timeout(10000);

  condit('Test unsuccessful service account key listing', condit.hasenvs(GOOGLE_CI_ENV_NAMES), async () => {
    try {
      await auth(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));
      await listServiceAccountKeys('non-existant', 'new-bar');
      assert.fail('This should never happen, because the project does not exist');
    } catch (e) {
      assert.ok(e);
    }
  }).timeout(10000);

  condit('Test successful service account key deletion', condit.hasenvs(GOOGLE_CI_ENV_NAMES), async () => {
    await auth(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));

    await createServiceAccount(process.env.GOOGLE_PROJECT_ID, 'test-account');
    await createServiceAccountKey(process.env.GOOGLE_PROJECT_ID, 'test-account');
    const keys = await listServiceAccountKeys(process.env.GOOGLE_PROJECT_ID, 'test-account');
    keys.forEach(async ({ name }) => {
      try {
        const result = await deleteServiceAccountKey(name);
        assert.ok(result === true || result === false);
      } catch (e) {
        assert.fail(e);
      }
    });
    const newkeys = await listServiceAccountKeys(process.env.GOOGLE_PROJECT_ID, 'test-account');
    assert.ok(newkeys);
    assert.ok(Array.isArray(newkeys));
    assert.notEqual(newkeys.length, keys.length);
  }).timeout(20000);

  condit('Test unsuccessful service account key deletion', condit.hasenvs(GOOGLE_CI_ENV_NAMES), async () => {
    try {
      await auth(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));
      await deleteServiceAccountKey('non-existant', 'new-bar', 'totally-made-up');
      assert.fail('This should never happen, because the project does not exist');
    } catch (e) {
      assert.ok(e);
    }
  }).timeout(10000);

  condit('Test successful IAM Policy Retrieval', condit.hasenvs(GOOGLE_CI_ENV_NAMES), async () => {
    await auth(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));
    const policy = await getIamPolicy(process.env.GOOGLE_PROJECT_ID, 'test_dataset');
    assert.ok(policy);
    assert.equal(policy.kind, 'bigquery#dataset');
    assert.ok(Array.isArray(policy.access));
  });

  condit('Test unsuccessful IAM Policy Retrieval', condit.hasenvs(GOOGLE_CI_ENV_NAMES), async () => {
    try {
      await auth(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));
      await getIamPolicy(process.env.GOOGLE_PROJECT_ID, 'missing_dataset');
      assert.fail('This should never happen, because the dataset does not exist');
    } catch (e) {
      assert.ok(e);
    }
  });

  condit('Test successful IAM Policy Update', condit.hasenvs(GOOGLE_CI_ENV_NAMES), async () => {
    await auth(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));
    const policy = await addIamPolicy(process.env.GOOGLE_PROJECT_ID, 'test_dataset', 'WRITER', `new-bar@${process.env.GOOGLE_PROJECT_ID}.iam.gserviceaccount.com`);
    assert.ok(policy);
    assert.equal(policy.kind, 'bigquery#dataset');
    assert.ok(Array.isArray(policy.access));
    const added = policy.access.filter(({ role, userByEmail }) => role === 'WRITER' && userByEmail === `new-bar@${process.env.GOOGLE_PROJECT_ID}.iam.gserviceaccount.com`);
    assert.equal(added.length, 1);
  });

  condit('Test unsuccessful IAM Policy Update', condit.hasenvs(GOOGLE_CI_ENV_NAMES), async () => {
    try {
      await auth(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));
      await addIamPolicy(process.env.GOOGLE_PROJECT_ID, 'missing_dataset', 'INVALIDROLE', 'not@a.valid.email');
      assert.fail('This should never happen, because the dataset does not exist');
    } catch (e) {
      assert.ok(e);
    }
  });
});
