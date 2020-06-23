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
const initfastly = require('@adobe/fastly-native-promises');
const { info, debug, error } = require('@adobe/helix-log');
const iam = require('./google/iam');
const auth = require('./google/auth');
const bigquery = require('./google/bigquery');
const logs = require('./fastly/logs');
const bigquerySchema = require('./google/schema');
const coralogixSchema = require('./coralogix/schema');

const tablename = 'requests';

const logconfigname = 'helix-logging';

/**
 *
 * @param {string} email email address of the Google service account
 * @param {string} key private key of the global Google service account
 * @param {string} service the Fastly service config ID
 * @param {string} token the Fastly authentication token
 * @param {string} project the Google project ID
 * @param {string} version the Fastly service config version to update
 */
async function addlogger({
  email, key, service, token, project, version, coralogixkey, coralogixapp,
}) {
  debug(`Adding logger for service config ${service}`);
  try {
    const authclient = await auth.googleauth(email, key);

    const authFastly = (async () => {
      // verify Fastly credentials
      const Fastly = await initfastly(token, service);
      const versions = await Fastly.getVersions();
      info(`Successfully authenticated with Fastly. Current version is ${versions.current}`);
      return Fastly;
    });
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
      fastlyClient,
      googleKeys,
      dataSet] = await Promise.all([
      authFastly(),
      createGoogleKey(),
      createGoogleTable()]);

    debug(`Setting up permissions for ${googleKeys.email} on ${dataSet.id}`);
    await iam.addIamPolicy(project, dataSet.id, 'WRITER', googleKeys.email, authclient);

    debug(`Updating Fastly service config ${service} to send logs to ${dataSet.id} with user ${googleKeys.email}`);
    const bigquerylogconfigtask = logs.updateFastlyVersion(
      fastlyClient,
      version,
      logconfigname,
      Object.assign(bigquerySchema, { service_config: service }),
      googleKeys.email,
      project,
      dataSet.id,
      tablename,
      '%Y%m',
      googleKeys.key,
    );

    const coralogixlogconfigtask = (coralogixapp && coralogixkey)
      ? logs.updateFastlyVersionWithCoralogix(
        fastlyClient,
        version,
        'helix-coralogix',
        service,
        coralogixSchema,
        coralogixkey,
        coralogixapp,
      ) : Promise.resolve();

    const [logconfig] = await Promise.all([bigquerylogconfigtask, coralogixlogconfigtask]);

    info(`Successfully updated Fastly service config ${service} to send logs to ${dataSet.id} with user ${googleKeys.email}`);
    return {
      name: logconfig.data.name,
      service: logconfig.data.service_id,
      project: logconfig.data.project_id,
      version: logconfig.data.version,
      dataset: logconfig.data.dataset,
      format: JSON.parse(logconfig.data.format),
    };
  } catch (e) {
    error(`Unable to add logger to service config ${service}: ${e} (in ${e.stack})`, e);
    throw e;
  }
}

module.exports = addlogger;
