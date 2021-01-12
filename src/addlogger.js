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
const initfastly = require('@adobe/fastly-native-promises');
const log = require('@adobe/helix-log');

const { error } = log;
const google = require('./google/logger');
const coralogix = require('./coralogix/logger');

const loggers = [google, coralogix];

/**
 *
 * @param {string} email email address of the Google service account
 * @param {string} key private key of the global Google service account
 * @param {string} service the Fastly service config ID
 * @param {string} token the Fastly authentication token
 * @param {string} project the Google project ID
 * @param {string} version the Fastly service config version to update
 */
async function addlogger(params) {
  const {
    service, token,
  } = params;

  try {
    const fastly = await initfastly(token, service);

    const jobs = loggers
      .filter((logger) => logger.check(params))
      .map((logger) => logger.add(params, fastly, log));

    if (jobs.length === 0) {
      throw new Error('No eligable loggers found');
    }

    await Promise.all(jobs);

    return {
      message: 'successfully set up logging',
    };
  } catch (e) {
    error(`Unable to add logger to service config ${service}: ${e} (in ${e.stack})`, e);
    throw e;
  }
}

module.exports = addlogger;
