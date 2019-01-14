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


function makeFormat(patterns) {
  return JSON.stringify(patterns, undefined, 2);
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
  key) {
  const fastly = await f(token, service);
  await fastly.transact(async (version) => {
    const data = makeConfig(name, patterns, user, project, dataset, table, suffix, key);
    return fastly.writeBigquery(version, name, data);
  });
  return fastly;
}

module.exports = { makeConfig, makeFormat, updateFastlyConfig };
