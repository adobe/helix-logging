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
      timeout: 2000,
    });

    return await request.get(options);
  } catch (e) {
    throw new Error(`Service account ${name} does not exist in project ${project}: ${e}`);
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
      timeout: 2000,
      body: {
        accountId: name,
        serviceAccount: {
          displayName: `${name} Account created by Helix-Logger`,
        },
      },
    });

    return await request.post(options);
  } catch (e) {
    if (e.statusCode === 409) {
      // account ID already exists
      return getServiceAccount(project, name);
    }
    throw new Error(`Service account ${name} cannot be created: ${e}`);
  }
}

async function listServiceAccountKeys(project, name) {
  try {
    const account = await createServiceAccount(project, name);
    const uri = `https://iam.googleapis.com/v1/${account.name}/keys`;

    const options = await googleapis.google.auth.authorizeRequest({
      uri,
      json: true,
      timeout: 2000,
    });

    const { keys } = await request.get(options);
    return keys;
  } catch (e) {
    throw new Error(`Unable to list keys for service account ${name} in project ${project}: ${e}`);
  }
}

/**
 * Delete the service account with the given name.
 * @param {String} name in the format
 * projects/<project>/serviceAccounts/<account>@<project>.iam.gserviceaccount.com/keys/<id>
 */
async function deleteServiceAccountKey(name) {
  try {
    const uri = `https://iam.googleapis.com/v1/${name}`;

    const options = await googleapis.google.auth.authorizeRequest({
      uri,
      json: true,
      timeout: 2000,
    });
    const result = await request.delete(options);
    return !!(result);
  } catch (e) {
      throw new Error(`Unable to delete key ${name}: ${e}`);
  }
}

/**
 * Creates a service account key for a given service accoun.
 * If the account does not already exist,
 * creates both account and key.
 * @param {String} project project ID
 * @param {String} name name of the new service account
 */
async function createServiceAccountKey(project, name, retry = true) {
  function again() {
    return createServiceAccountKey(project, name, false);
  }

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
    if (e.statusCode && e.statusCode === 429 && e.error && e.error.error && e.error.error.status && e.error.error.status === 'RESOURCE_EXHAUSTED' && retry) {
      const keys = await listServiceAccountKeys(project, name);

      // only delete the two oldest keys
      const deletekeys = keys.slice(0, 4).map(key => key.name).map(deleteServiceAccountKey);

      // wait for deletion to complete
      return Promise.all(deletekeys).then(again).catch(again);
    }
    throw new Error(`Unable to create key for service account ${name} in project ${project}: ${e}`);
  }
}

/**
 * Gets the IAM Policy for a dataset in a project.
 * @param {String} project project id
 * @param {String} dataset dataset id
 */
async function getIamPolicy(project, dataset) {
  try {
    const uri = `https://www.googleapis.com/bigquery/v2/projects/${project}/datasets/${dataset}`;

    const options = await googleapis.google.auth.authorizeRequest({
      uri,
      json: true,
      timeout: 10000, // note the raised timeout
    });

    return await request.get(options);
  } catch (e) {
    throw new Error(`Cannot get IAM policy for dataset ${dataset} in project ${project}: ${e}`);
  }
}

/**
 * Grants a role to the user specified by provided email address on the
 * dataset in the project.
 * @param {String} project project id
 * @param {String} dataset dataset id
 * @param {String} role can be READER, WRITER, OWNER
 * @param {String} email email address of the user or service account
 */
async function addIamPolicy(project, dataset, role, email) {
  try {
    const uri = `https://www.googleapis.com/bigquery/v2/projects/${project}/datasets/${dataset}`;

    const oldaccess = (await getIamPolicy(project, dataset)).access;

    const options = await googleapis.google.auth.authorizeRequest({
      uri,
      json: true,
      timeout: 2000,
      body: {
        access: [
          ...oldaccess,
          {
            role,
            userByEmail: email,
          },
        ],
      },
    });

    return await request.patch(options);
  } catch (e) {
    throw new Error(`Cannot update IAM policy for dataset ${dataset} in project ${project}: ${e}`);
  }
}

module.exports = {
  createServiceAccount,
  getServiceAccount,
  createServiceAccountKey,
  listServiceAccountKeys,
  deleteServiceAccountKey,
  getIamPolicy,
  addIamPolicy,
};
