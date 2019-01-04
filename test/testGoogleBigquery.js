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
const { BigQuery } = require('@google-cloud/bigquery');
const { auth } = require('../src/google/auth');
const { createDataset } = require('../src/google/bigquery');

describe('Test google.bigquery', () => {
  if (process.env.CLIENT_EMAIL && process.env.PRIVATE_KEY && process.env.PROJECT_ID) {
    it('Testing authentication', async () => {
      const credentials = await auth(process.env.CLIENT_EMAIL, process.env.PRIVATE_KEY.replace(/\\n/g, '\n'));
      const bq = new BigQuery({
        projectId: process.env.PROJECT_ID,
        credentials,
      });
      assert.ok(bq);
    });

    it('Testing unsuccessful data set creation', async () => {
      try {
        const dataset = await createDataset(process.env.CLIENT_EMAIL, process.env.PRIVATE_KEY.replace(/\\n/g, '\n'), process.env.PROJECT_ID, 'test-dataset');
        assert.fail('dataset is invalid', dataset);
      } catch (e) {
        assert.ok(e);
      }
    });

    it('Testing successful data set creation', async () => {
      const dataset = await createDataset(process.env.CLIENT_EMAIL, process.env.PRIVATE_KEY.replace(/\\n/g, '\n'), process.env.PROJECT_ID, 'test_dataset');
      assert.ok(dataset);
    });
  } else {
    it.skip('Testing google bigquery (needs authentication)');
  }
});
