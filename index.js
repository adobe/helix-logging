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

const { wrap } = require('@adobe/helix-pingdom-status');
// const { openWhiskWrapper } = require('epsagon');
const addlogger = require('./src/addlogger');

async function main(params) {
  return {
    body: await addlogger({
      email: params.CLIENT_EMAIL,
      key: params.PRIVATE_KEY,
      service: params.service,
      token: params.token,
      project: params.PROJECT_ID,
      version: params.version,
    }),
  };
}


module.exports.main = wrap(main, {
  fastly: 'https://api.fastly.com/docs',
  googleiam: 'https://iam.googleapis.com/$discovery/rest?version=v1',
  googlebigquery: 'https://www.googleapis.com/discovery/v1/apis/bigquery/v2/rest',
});
