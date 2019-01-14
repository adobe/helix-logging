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

const { BigQuery } = require('@google-cloud/bigquery');
const { auth } = require('./auth');

async function createDataset(email, key, project, name) {
  const credentials = await auth(email, key);
  const bq = new BigQuery({
    projectId: project,
    credentials,
  });
  try {
    return await bq.createDataset(name);
  } catch (e) {
    if (e.code && e.code === 409 && e.errors && e.errors[0] && e.errors[0].reason && e.errors[0].reason === 'duplicate') {
      return await bq.dataset(name);
    }
    throw new Error(`Unable to create dataset ${name}: ${e}`);
  }
}

async function createTable(email, key, project, dataset, name, fields) {
  const ds = await createDataset(email, key, project, dataset);
  try {
    return await ds.createTable(name, {
      description: 'Table created by Helix Logging',
      schema: {
        fields,
      },
      timePartitioning: {
        type: 'DAY',
      },
    });
  } catch (e) {
    if (e.code && e.code === 409 && e.errors && e.errors[0] && e.errors[0].reason && e.errors[0].reason === 'duplicate') {
      return ds.table(name);
    }
    throw new Error(`Unable to create table ${name} in dataset ${dataset}: ${e}`);
  }
}

/**
 * Creates a field specification from a list of column names
 * @param {Array[string]} names
 * @returns {Object} a field specification for Google Bigquery
 */
function makeFields(names) {
  return names.reduce((p, c) => {
    const col = {};
    col[c] = 'string';
    return [...p, col];
  }, []);
}

module.exports = {
  createDataset,
  createTable,
  makeFields,
};
