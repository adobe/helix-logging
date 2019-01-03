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

const googleapis = require('googleapis');
const request = require('request-promise-native');
/**
 * Gets a service account for a given project
 * @param {String} project project ID
 * @param {String} name name of the new service account
 */
async function getServiceAccount(project, name) {
  try {
    const options = await googleapis.google.auth.authorizeRequest({
      uri:
        `https://iam.googleapis.com/v1/projects/${project}/serviceAccounts/${name}@${project}.iam.gserviceaccount.com`,
      json: true,
      timeout: 1000,
    });

    return await request.get(options);
  } catch (e) {
    throw new Error(`Service account ${name} does not exist in project ${project}`);
  }
}

/**
 * Creates a service account for a given project. If the account already exists,
 * retrieves the account instead.
 * @param {String} project project ID
 * @param {String} name name of the new service account
 */
async function createServiceAccount(project, name) {
  try {
    const options = await googleapis.google.auth.authorizeRequest({
      uri: `https://iam.googleapis.com/v1/projects/${project}/serviceAccounts`,
      json: true,
      timeout: 1000,
      body: {
        accountId: name,
        serviceAccount: {
          displayName: `${name} Account created by Helix-Logger`,
        },
      },
    });

    return await request.post(options);
  } catch (e) {
    // account ID already exists
    return getServiceAccount(project, name);
  }
}

/**
 * Creates a service account key for a given service accoun.
 * If the account does not already exist,
 * creates both account and key.
 * @param {String} project project ID
 * @param {String} name name of the new service account
 */
async function createServiceAccountKey(project, name) {
  try {
    const account = await createServiceAccount(project, name);
    const uri = `https://iam.googleapis.com/v1/${account.name}/keys`;

    const options = await googleapis.google.auth.authorizeRequest({
      uri,
      json: true,
      timeout: 10000, // note the raised timeout
    });

    const key = await request.post(options);
    const data = JSON.parse(Buffer.from(key.privateKeyData, 'base64').toString('ascii'));

    return data;
  } catch (e) {
    throw new Error(`Unable to create key for service account ${name} in project ${project}: ${e}`);
  }
}

module.exports = {
  createServiceAccount,
  getServiceAccount,
  createServiceAccountKey,
};
