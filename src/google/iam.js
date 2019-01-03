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

async function createServiceAccount(project, name) {
  try {
    const options = await googleapis.google.auth.authorizeRequest({
      uri: `https://iam.googleapis.com/v1/projects/${project}/serviceAccounts`,
      json: true,
      timeout: 1000,
      body: {
        accountId: name,
        serviceAccount: {
          displayName: 'foo-bar Account created by Helix-Logger',
        },
      }
    });

    return await request.post(options);
  } catch (e) {
    // account ID already exists
    return getServiceAccount(project, name);
  }
}

async function getServiceAccount(project, name) {
  try {
    const options = await googleapis.google.auth.authorizeRequest({
      uri:
        `https://iam.googleapis.com/v1/projects/${project}/serviceAccounts/${name}@${project}.iam.gserviceaccount.com`,
      json: true,
      timeout: 1000
    });

    return await request.get(options);
  } catch (e) {
    throw new Error(`Service account ${name} does not exist in project ${project}`);
  }
}

module.exports = {
  createServiceAccount,
  getServiceAccount,
};
