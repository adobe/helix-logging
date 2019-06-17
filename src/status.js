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
const request = require('request-promise-native');
const { version } = require('../package.json');

module.exports = async () => {
  const start = Date.now();

  try {
    await Promise.all([
      request.get('https://api.fastly.com/docs'),
      request.get('https://iam.googleapis.com/$discovery/rest?version=v1'),
      request.get('https://www.googleapis.com/discovery/v1/apis/bigquery/v2/rest'),
    ]);
  } catch (err) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml',
        'X-Version': version,
        'Cache-Control': 'no-store, private, must-revalidate',
      },
      body: `<pingdom_http_custom_check>
              <status>Error: ${err}</status>
              <version>${version}</version>
              <response_time>${Math.abs(Date.now() - start)}</response_time>
          </pingdom_http_custom_check>`,
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml',
      'X-Version': version,
      'Cache-Control': 'no-store, private, must-revalidate',
    },
    body: `<pingdom_http_custom_check>
            <status>OK</status>
            <version>${version}</version>
            <response_time>${Math.abs(Date.now() - start)}</response_time>
        </pingdom_http_custom_check>`,
  };
};
