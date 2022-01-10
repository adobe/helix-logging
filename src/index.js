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

const { wrap: statusWrap } = require('@adobe/helix-status');
const wrap = require('@adobe/helix-shared-wrap');
const { logger } = require('@adobe/helix-universal-logger');
const { Response } = require('@adobe/helix-fetch');

const addlogger = require('./addlogger');
const { StatusCodeError } = require('./util.js');

async function setupLogger(request, context) {
  const { log } = context;
  if (!request.body) {
    return new Response('Bad request', {
      status: 400,
      headers: {
        'x-error': 'Missing request body',
      },
    });
  }
  log.info(`Setting up logging: ${request.headers.get('content-type')}`);

  try {
    let res;
    if (/^application\/x-www-form-urlencoded/.test(request.headers.get('content-type'))) {
      log.info('Getting parameters from formdata');
      const data = new URLSearchParams(await request.text());
      res = await addlogger({
        email: context.env.GOOGLE_CLIENT_EMAIL,
        key: context.env.GOOGLE_PRIVATE_KEY,
        project: context.env.GOOGLE_PROJECT_ID,
        // request parameters
        service: data.get('service'),
        token: data.get('token'),
        version: data.get('version'),
        coralogixkey: data.get('coralogixkey'),
        coralogixapp: data.get('coralogixapp'),
        splunkhost: data.get('splunkhost'),
        splunkauth: data.get('splunkauth'),
      }, log);
    } else {
      log.info('Getting parameters from json body');
      const params = await request.json();
      res = await addlogger({
        email: context.env.GOOGLE_CLIENT_EMAIL,
        key: context.env.GOOGLE_PRIVATE_KEY,
        project: context.env.GOOGLE_PROJECT_ID,
        // request parameters
        service: params.service,
        token: params.token,
        version: params.version,
        coralogixkey: params.coralogixkey,
        coralogixapp: params.coralogixapp,
        splunkhost: params.splunkhost,
        splunkauth: params.splunkauth,
      }, log);
    }

    return new Response(res);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return new Response('Bad request', {
        status: 400,
        headers: {
          'x-error': err.message,
        },
      });
    }
    if (err instanceof StatusCodeError) {
      return new Response(err.message, {
        status: err.status,
        headers: {
          'x-error': err.message,
        },
      });
    }
    log.error('Something went wrong', err);
    return new Response(err.message, {
      status: 500,
      headers: {
        'x-error': err.message,
      },
    });
  }
}

/**
 * Main function called by the openwhisk invoker.
 * @param params Action params
 * @returns {Promise<*>} The response
 */
module.exports.main = wrap(setupLogger)
  .with(statusWrap, {
    fastly: 'https://api.fastly.com/public-ip-list',
    // googleiam: 'https://iam.googleapis.com/$discovery/rest?version=v1',
    // googlebigquery: 'https://www.googleapis.com/discovery/v1/apis/bigquery/v2/rest',
  })
  .with(logger);
