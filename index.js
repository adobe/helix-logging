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
// const googleapis = require('googleapis');
// const request = require('request-promise-native');

async function main() {
  /*
  await googleapis.google.auth.getClient({
    // Scopes can be specified either as an array or as a single, space-delimited string.
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    credentials: {
      client_email: key.client_email,
      private_key: key.private_key,
    },
  });

  const headers = await googleapis.google.auth.getRequestHeaders(
    'https://iam.googleapis.com/v1/projects/helix-225321/serviceAccounts',
  );

  try {
    const response = await request.post(
      'https://iam.googleapis.com/v1/projects/helix-225321/serviceAccounts',
      {
        headers,
        json: true,
        body: {
          accountId: 'foo-bar',
          serviceAccount: {
            displayName: 'foo-bar Logging Account',
          },
        },
      },
    );

    console.log(response);
  } catch (e) {
    // service account already exists

    const account = await request.get(
      await googleapis.google.auth.authorizeRequest({
        uri:
          'https://iam.googleapis.com/v1/projects/helix-225321/serviceAccounts/foo-bar@helix-225321.iam.gserviceaccount.com',
        json: true,
      }),
    );

    console.log(account);
  }

  const { accounts } = await request.get(
    'https://iam.googleapis.com/v1/projects/helix-225321/serviceAccounts',
    { headers, json: true },
  );
  console.log(accounts.map(account => account.name));
  */
}
/* eslint-disable-next-line no-console */
main().catch(console.error);
