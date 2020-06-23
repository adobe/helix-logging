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
/* eslint-env mocha */
const { condit } = require('@adobe/helix-testutils');
const { auth } = require('../src/google/auth');

describe('Test google.auth', () => {
  condit('Test successful authentication', condit.hasenvs(['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY']), (done) => {
    auth(process.env.GOOGLE_CLIENT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'))
      .then(() => done())
      .catch(done);
  });

  it('Test unsuccessful authentication', (done) => {
    auth('foo', 'bar')
      .then(() => done('should throw error'))
      .catch(() => done());
  });
});
