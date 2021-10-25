/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

class StatusCodeError extends Error {
  constructor(msg, e) {
    super(msg ? `${msg}: ${e.message}` : e.message);

    this._detail = e;
    this._status = e.status || e.statusCode || e.code || 500;
  }

  get detail() {
    return this._detail;
  }

  get status() {
    return this._status;
  }
}

function wrapError(msg, e) {
  if (!msg && e instanceof StatusCodeError) {
    return e;
  }
  return new StatusCodeError(msg, e);
}

module.exports = {
  StatusCodeError,
  wrapError,
};
