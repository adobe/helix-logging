const googleapis = require("googleapis");
const path = require("path");
const request = require("request-promise-native");
const key = require("./service-account-key.json");

async function main() {
  const auth = await googleapis.google.auth.getClient({
    // Scopes can be specified either as an array or as a single, space-delimited string.
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    credentials: {
      client_email: key.client_email,
      private_key: key.private_key
    }
  });

  const headers = await googleapis.google.auth.getRequestHeaders(
    "https://iam.googleapis.com/v1/projects/helix-225321/serviceAccounts"
  );

  try {
    const response = await request.post(
      "https://iam.googleapis.com/v1/projects/helix-225321/serviceAccounts",
      {
        headers,
        json: true,
        body: {
          accountId: "foo-bar",
          serviceAccount: {
            displayName: "foo-bar Logging Account"
          }
        }
      }
    );

    console.log(response);
  } catch (e) {
    // service account already exists

    const account = await request.get(
      await googleapis.google.auth.authorizeRequest({
        uri:
          "https://iam.googleapis.com/v1/projects/helix-225321/serviceAccounts/foo-bar@helix-225321.iam.gserviceaccount.com",
        json: true,
      })
    );

    console.log(account);
  }

  const { accounts } = await request.get(
    "https://iam.googleapis.com/v1/projects/helix-225321/serviceAccounts",
    { headers, json: true }
  );
  console.log(accounts.map(account => account.name));
}

main().catch(console.error);
