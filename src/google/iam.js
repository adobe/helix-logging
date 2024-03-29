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

const fetchAPI = require('@adobe/helix-fetch');
const { wrapError } = require('../util.js');

/* istanbul ignore next */
const { fetch, timeoutSignal } = process.env.HELIX_FETCH_FORCE_HTTP1
  ? fetchAPI.context({ alpnProtocols: [fetchAPI.ALPN_HTTP1_1] })
  /* istanbul ignore next */
  : fetchAPI;

async function makeGoogleHTTPRequest(options, auth) {
  const { timeout } = options;
  // eslint-disable-next-line no-param-reassign
  delete options.timeout;

  const signal = timeoutSignal(timeout);

  try {
    const res = await fetch(options.uri, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...await auth.getRequestHeaders(options.uri),
        signal,
      },
    });

    if (!res.ok) {
      const e = new Error((await res.json()).error.message);
      e.statusCode = res.status;
      throw e;
    }

    return res.json();
    // eslint-disable-next-line no-useless-catch
  } catch (e) {
    // could be HTTP error, syntax error, abort error
    // the only one that gets a retry is the 429 error
    throw e;
  } finally {
    signal.clear();
  }
}

/**
 * Gets a service account for a given project
 * @param {String} project project ID
 * @param {String} name name of the new service account
 */
async function getServiceAccount(project, name, auth) {
  try {
    const options = {
      uri:
        `https://iam.googleapis.com/v1/projects/${project}/serviceAccounts/${name}@${project}.iam.gserviceaccount.com`,
      timeout: 2000,
    };

    return await makeGoogleHTTPRequest(options, auth);
  } catch (e) {
    throw wrapError(`Service account ${name} does not exist in project ${project}`, e);
  }
}

/**
 * Creates a service account for a given project. If the account already exists,
 * retrieves the account instead.
 * @param {String} project project ID
 * @param {String} name name of the new service account
 */
async function createServiceAccount(project, name, auth) {
  try {
    const options = {
      uri: `https://iam.googleapis.com/v1/projects/${project}/serviceAccounts`,
      timeout: 2000,
      method: 'POST',
      body: JSON.stringify({
        accountId: name,
        serviceAccount: {
          displayName: `${name} Account created by Helix-Logger`,
        },
      }),
    };

    return await makeGoogleHTTPRequest(options, auth);
  } catch (e) {
    if (e.statusCode === 409) {
      // account ID already exists
      return getServiceAccount(project, name, auth);
    }
    throw wrapError(`Service account ${name} cannot be created`, e);
  }
}

async function listServiceAccountKeys(project, name, auth) {
  try {
    const account = await createServiceAccount(project, name, auth);
    const uri = `https://iam.googleapis.com/v1/${account.name}/keys`;

    const options = {
      uri,
      timeout: 2000,
    };

    const { keys } = await makeGoogleHTTPRequest(options, auth);
    return keys;
  } catch (e) {
    throw wrapError(`Unable to list keys for service account ${name} in project ${project}`, e);
  }
}

/**
 * Delete the service account with the given name.
 * @param {String} name in the format
 * projects/<project>/serviceAccounts/<account>@<project>.iam.gserviceaccount.com/keys/<id>
 */
async function deleteServiceAccountKey(name, auth) {
  try {
    const uri = `https://iam.googleapis.com/v1/${name}`;

    const options = {
      method: 'DELETE',
      uri,
      timeout: 2000,
    };

    return !!(await makeGoogleHTTPRequest(options, auth));
  } catch (e) {
    throw wrapError(`Unable to delete key ${name}`, e);
  }
}

/**
 * Creates a service account key for a given service accoun.
 * If the account does not already exist,
 * creates both account and key.
 * @param {String} project project ID
 * @param {String} name name of the new service account
 */
async function createServiceAccountKey(project, name, auth) {
  try {
    const account = await createServiceAccount(project, name, auth);
    const uri = `https://iam.googleapis.com/v1/${account.name}/keys`;

    const options = {
      uri,
      method: 'POST',
      timeout: 10000, // note the raised timeout
    };

    // preemptively delete keys, as key deletion takes a long
    // time and we do not want to get in a state where the
    // key creation can fail.
    const keys = await listServiceAccountKeys(project, name, auth);
    if (keys.length > 6) {
      const deletekeys = keys
        .slice(0, 4)
        .map((key) => key.name)
        .map((sname) => deleteServiceAccountKey(sname, auth).catch(() => undefined));

      // wait for deletion to complete
      await Promise.all(deletekeys);
    }

    const key = await makeGoogleHTTPRequest(options, auth);
    const data = JSON.parse(Buffer.from(key.privateKeyData, 'base64').toString('ascii'));

    return data;
  } catch (e) {
    throw wrapError(`Unable to create key for service account ${name} in project ${project}`, e);
  }
}

/**
 * Gets the IAM Policy for a dataset in a project.
 * @param {String} project project id
 * @param {String} dataset dataset id
 */
async function getIamPolicy(project, dataset, auth) {
  try {
    const uri = `https://www.googleapis.com/bigquery/v2/projects/${project}/datasets/${dataset}`;

    const options = {
      uri,
      timeout: 10000, // note the raised timeout
    };

    return await makeGoogleHTTPRequest(options, auth);
  } catch (e) {
    throw wrapError(`Cannot get IAM policy for dataset ${dataset} in project ${project}`, e);
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
async function addIamPolicy(project, dataset, role, email, auth) {
  try {
    const uri = `https://www.googleapis.com/bigquery/v2/projects/${project}/datasets/${dataset}`;

    const oldaccess = (await getIamPolicy(project, dataset, auth)).access;

    const options = {
      uri,
      timeout: 2000,
      method: 'PATCH',
      body: JSON.stringify({
        access: [
          ...oldaccess,
          {
            role,
            userByEmail: email,
          },
        ],
      }),
    };

    return await makeGoogleHTTPRequest(options, auth);
  } catch (e) {
    throw wrapError(`Cannot update IAM policy for dataset ${dataset} in project ${project}`, e);
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
