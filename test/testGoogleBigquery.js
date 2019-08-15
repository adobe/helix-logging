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
const { condit } = require('@adobe/helix-testutils');
const { auth } = require('../src/google/auth');
const { createDataset, createTable, makeFields } = require('../src/google/bigquery');

describe('Test google.bigquery', () => {
  condit('Testing authentication', condit.hasenvs(['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_PROJECT_ID']), async () => {
    const credentials = await auth(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'));
    const bq = new BigQuery({
      projectId: process.env.GOOGLE_PROJECT_ID,
      credentials,
    });
    assert.ok(bq);
  });

  condit('Testing unsuccessful data set creation', condit.hasenvs(['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_PROJECT_ID']), async () => {
    try {
      const dataset = await createDataset(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), process.env.GOOGLE_PROJECT_ID, 'test-dataset');
      assert.fail('dataset is invalid', dataset);
    } catch (e) {
      assert.ok(e);
    }
  });

  condit('Testing successful data set creation', condit.hasenvs(['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_PROJECT_ID']), async () => {
    const dataset = await createDataset(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), process.env.GOOGLE_PROJECT_ID, 'test_dataset');
    assert.ok(dataset);
  });

  condit('Testing successful table creation', condit.hasenvs(['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_PROJECT_ID']), async () => {
    const dataset = await createTable(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), process.env.GOOGLE_PROJECT_ID, 'test_dataset', 'test_logs', [
      { name: 'client_as_name', type: 'string' },
      { name: 'client_geo_city', type: 'string' },
      { name: 'client_geo_conn_speed', type: 'string' },
      { name: 'client_geo_continent_code', type: 'string' },
      { name: 'client_geo_country_code', type: 'string' },
      { name: 'client_geo_gmt_offset', type: 'string' },
      { name: 'client_geo_latitude', type: 'string' },
      { name: 'client_geo_longitude', type: 'string' },
      { name: 'client_geo_metro_code', type: 'string' },
      { name: 'client_geo_postal_code', type: 'string' },
      { name: 'client_geo_region', type: 'string' },
      { name: 'client_ip_hashed', type: 'string' },
      { name: 'client_ip_masked', type: 'string' },
      { name: 'resp_http_x_openwhisk_activation_id', type: 'string' },
      { name: 'fastly_info_state', type: 'string' },
      { name: 'req_http_host', type: 'string' },
      { name: 'req_http_Referer', type: 'string' },
      { name: 'req_http_User_Agent', type: 'string' },
      { name: 'req_http_X_CDN_Request_ID', type: 'string' },
      { name: 'req_http_X_Host', type: 'string' },
      { name: 'req_http_X_Owner', type: 'string' },
      { name: 'req_http_X_Ref', type: 'string' },
      { name: 'req_http_X_Repo', type: 'string' },
      { name: 'req_http_X_Static', type: 'string' },
      { name: 'req_http_X_Strain', type: 'string' },
      { name: 'req_http_X_URL', type: 'string' },
      { name: 'req_url', type: 'string' },
      { name: 'resp_http_Content_Type', type: 'string' },
      { name: 'resp_http_X_Version', type: 'string' },
      { name: 'server_datacenter', type: 'string' },
      { name: 'server_region', type: 'string' },
      { name: 'service_config', type: 'string' },
      { name: 'status_code', type: 'string' },
      { name: 'time_end_usec', type: 'string' },
      { name: 'time_start_usec', type: 'string' },
      { name: 'vcl_sub', type: 'string' },
    ]);
    assert.ok(dataset);
  });

  condit('Testing unsuccessful table creation', condit.hasenvs(['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_PROJECT_ID']), async () => {
    try {
      const table = await createTable(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), process.env.GOOGLE_PROJECT_ID, 'test_dataset', 'illegal-table');
      assert.fail(table);
    } catch (e) {
      assert.ok(e);
    }
  });

  it('Testing makeFields', () => {
    assert.deepEqual(makeFields(['foo', 'bar', 'baz']), [
      { name: 'foo', type: 'string' },
      { name: 'bar', type: 'string' },
      { name: 'baz', type: 'string' }]);
  });
});
