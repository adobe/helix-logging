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
const f = require('@adobe/fastly-native-promises');
const { toString } = require('../util/schemahelper');

function makeFormat(patterns) {
  return toString(patterns);
}

function makeConfig(name, patterns, user, project, dataset, table, suffix, key) {
  return {
    name,
    format: makeFormat(patterns),
    user,
    project_id: project,
    dataset,
    table,
    template_suffix: suffix,
    secret_key: key,
  };
}

function makeCoralogixConfig(name, service, pattern, key, application) {
  return {
    name,
    format: toString(Object.assign(pattern, { applicationName: application })),
    url: 'https://api.coralogix.com/logs/rest/singles',
    request_max_bytes: 2000000,
    content_type: 'application/json',
    header_name: 'private_key',
    header_value: key,
    json_format: 1,
    service_id: service,
  };
}

/**
 *
 * @param {Fastly} fastly  Fastly client
 * @param {number} version version to update
 * @param {string} name the name of the logging config (must be unique per service)
 * @param {Object} patterns keys are the column names in Google BigQuery, values are the
 * VCL log expressions
 * @param {string} user email address of the Google Cloud service account
 * @param {string} project project ID of the Google Cloud Platform project
 * @param {string} dataset name of the dataset in Google BigQuery
 * @param {string} table of the table to create in the dataset
 * @param {string} suffix suffix pattern for time-based table partitions, e.g. %Y%M
 * @param {string} key private key of the Google Cloud Platform service account
 */
async function updateFastlyVersion(
  fastly,
  version,
  name,
  patterns,
  user,
  project,
  dataset,
  table,
  suffix,
  key,
) {
  const data = makeConfig(name, patterns, user, project, dataset, table, suffix, key);
  return fastly.writeBigquery(version, name, data);
}

async function updateFastlyVersionWithCoralogix(
  fastly,
  version,
  name,
  service,
  patterns,
  key,
  application,
) {
  const data = makeCoralogixConfig(name, service, patterns, key, application);
  return fastly.writeHttps(version, name, data);
}

/**
 * Updates the Fastly Service Config with a BigQuery logging configuration
 * @param {string} token the Fastly service token
 * @param {string} service the Fastly service config ID
 * @param {string} name the name of the logging config (must be unique per service)
 * @param {Object} patterns keys are the column names in Google Bigquery, values are the
 * VCL log expressions
 * @param {string} user email address of the Google Cloud service account
 * @param {string} project project ID of the Google Cloud Platform project
 * @param {string} dataset name of the dataset in Google BigQuery
 * @param {string} table of the table to create in the dataset
 * @param {string} suffix suffix pattern for time-based table partitions, e.g. %Y%M
 * @param {string} key private key of the Google Cloud Platform service account
 */
async function updateFastlyConfig(
  token,
  service,
  name,
  patterns,
  user,
  project,
  dataset,
  table,
  suffix,
  key,
) {
  const fastly = await f(token, service);
  await fastly.transact(async (version) => updateFastlyVersion(
    fastly,
    version,
    name,
    patterns,
    user,
    project,
    dataset,
    table,
    suffix,
    key,
  ));
  return fastly;
}

module.exports = {
  makeConfig,
  makeFormat,
  updateFastlyConfig,
  /* istanbul ignore next */
  updateFastlyVersion,
  updateFastlyVersionWithCoralogix,
};
