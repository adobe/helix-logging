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
const auth = require('./auth');
const bigquery = require('./bigquery');
const iam = require('./iam');
const logs = require('../fastly/logs');
const bigquerySchema = require('./schema');
const { str } = require('../util/schemahelper');

const tablename = 'requests';
const logconfigname = 'helix-logging';

function check(params) {
  return !!params.email && !!params.key;
}

async function add(params, fastlyClient, log) {
  const {
    email, key, service, project, version,
  } = params;
  const { info, debug, error } = log;

  try {
    const authclient = await auth.googleauth(email, key);

    const createGoogleKey = (async () => {
    // create Google Service Account, and Key
      const accountname = `hlx-${service}`.toLocaleLowerCase();
      debug(`Creating service account ${accountname} in Google Cloud Platform`);
      const account = await iam.createServiceAccount(project, accountname, authclient);
      debug(`Creating new service account key for ${account.name}`);
      const {
      /* eslint-disable camelcase */
        private_key_id, client_email, private_key,
      } = await iam.createServiceAccountKey(project, accountname, authclient);
      info(`Successfully created service account key ${private_key_id} for ${client_email}`);
      return {
        key: private_key,
        email: client_email,
      };
    });
    const createGoogleTable = (async () => {
    // create Google BigQuery Dataset, and Table
      const datasetname = `helix_logging_${service}`;
      const ds = await bigquery.createDataset(email, key, project, datasetname);
      // odd: bigquery.createDataset sometimes returns an array of datasets
      const dataset = Array.isArray(ds) ? ds[0] : ds;
      debug(`Successfully created Google BigQuery dataset ${dataset.id || datasetname}`);
      const table = await bigquery.createTable(
        email,
        key,
        project,
        datasetname,
        tablename,
        bigquery.makeFields(Object.keys(bigquerySchema)),
      );
      info(`Successfully created Google BigQuery table ${Array.isArray(table) ? table[0].id : table.id} in ${datasetname}`);
      return dataset;
    });
    // do these three things in parallel:
    const [
      googleKeys,
      dataSet] = await Promise.all([
      createGoogleKey(),
      createGoogleTable()]);

    debug(`Setting up permissions for ${googleKeys.email} on ${dataSet.id}`);
    await iam.addIamPolicy(project, dataSet.id, 'WRITER', googleKeys.email, authclient);

    debug(`Updating Fastly service config ${service} to send logs to ${dataSet.id} with user ${googleKeys.email}`);
    return logs.updateFastlyVersion(
      fastlyClient,
      version,
      logconfigname,
      Object.assign(bigquerySchema, { service_config: str(service) }),
      googleKeys.email,
      project,
      dataSet.id,
      tablename,
      '%Y%m',
      googleKeys.key,
    );
  } catch (e) {
    error('Unable to set up Google BigQuery logging', e);
    throw e;
  }
}

module.exports = { check, add };
