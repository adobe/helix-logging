/*
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const { wrap: status } = require('@adobe/helix-status');
const { wrap } = require('@adobe/openwhisk-action-utils');
const { logger } = require('@adobe/openwhisk-action-logger');
const { epsagon } = require('@adobe/helix-epsagon');

const addlogger = require('./addlogger');

async function setupLogger(params) {
  return {
    body: await addlogger({
      email: params.GOOGLE_CLIENT_EMAIL,
      key: params.GOOGLE_PRIVATE_KEY,
      service: params.service,
      token: params.token,
      project: params.GOOGLE_PROJECT_ID,
      version: params.version,
      coralogixkey: params.coralogixkey,
      coralogixapp: params.coralogixapp,
    }),
  };
}

/**
 * Main function called by the openwhisk invoker.
 * @param params Action params
 * @returns {Promise<*>} The response
 */
module.exports.main = wrap(setupLogger)
  .with(epsagon)
  .with(status, {
    fastly: 'https://api.fastly.com/public-ip-list',
    googleiam: 'https://iam.googleapis.com/$discovery/rest?version=v1',
    googlebigquery: 'https://www.googleapis.com/discovery/v1/apis/bigquery/v2/rest',
  })
  .with(logger.trace)
  .with(logger);
