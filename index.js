const {google} = require('googleapis')

async function main () {

  // This method looks for the GCLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS
  // environment variables.
  const auth = await google.auth.getClient({
    // Scopes can be specified either as an array or as a single, space-delimited string.
    scopes: ['https://www.googleapis.com/auth/compute']
  });

  // obtain the current project Id
  const project = await google.auth.getProjectId();

  // Fetch the list of GCE zones within a project.
  const res = await compute.zones.list({ project, auth });
  console.log(res.data);
}

main().catch(console.error);