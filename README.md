# Helix Logging Setup Microservice

[![Known Vulnerabilities](https://snyk.io/test/github/adobe/helix-logging/badge.svg?targetFile=package.json)](https://snyk.io/test/github/adobe/helix-logging?targetFile=package.json)
[![codecov](https://img.shields.io/codecov/c/github/adobe/helix-logging.svg)](https://codecov.io/gh/adobe/helix-logging)
[![CircleCI](https://img.shields.io/circleci/project/github/adobe/helix-logging.svg)](https://circleci.com/gh/adobe/helix-logging)
[![GitHub license](https://img.shields.io/github/license/adobe/helix-logging.svg)](https://github.com/adobe/helix-logging/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/adobe/helix-logging.svg)](https://github.com/adobe/helix-logging/issues) 
[![Greenkeeper badge](https://badges.greenkeeper.io/adobe/helix-logging.svg)](https://greenkeeper.io/)

> This is a simple microservice (to be used in conjunction with [Project Helix](https://www.project-helix.io/)) that sets up correct logging for a Project Helix-managed Fastly service config. It makes sure logs will be sent to Google BigQuery.

## Usage

Send a POST request with following parameters to `$ curl https://adobeioruntime.net/api/v1/web/helix/helix-services/logging@v1`:

* `service`: the Fastly service config ID of the service that should get updated
* `token`: a Fastly API token that has write permissions on the service above
* `version`: the version number of a checked out (draft) version of the service config above

```bash
$ curl -X POST -H "Content-Type: application/json" -d '{"service":"6E6ge7REhiWetPCqy9jht2","version":2,"token":"thisismysecret"}'
{
    "dataset": "helix_logging_6E6ge7REhiWetPCqy9jht2",
    "format": {
        "client_as_name": "%{client.as.name}V",
        "client_geo_city": "%{client.geo.city.utf8}V",
        "client_geo_conn_speed": "%{client.geo.conn_speed}V",
        "client_geo_continent_code": "%{client.geo.continent_code}V",
        "client_geo_country_code": "%{client.geo.country_code}V",
        "client_geo_gmt_offset": "%{client.geo.gmt_offset}V",
        "client_geo_latitude": "%{client.geo.latitude}V",
        "client_geo_longitude": "%{client.geo.longitude}V",
        "client_geo_metro_code": "%{client.geo.metro_code}V",
        "client_geo_postal_code": "%{client.geo.postal_code}V",
        "client_geo_region": "%{client.geo.region}V",
        "client_ip_hashed": "%{digest.hash_sha1(client.ip)}V",
        "client_ip_masked": "%{client.ip}V",
        "fastly_info_state": "%{fastly_info.state}V",
        "req_http_Referer": "%{req.http.Referer}V",
        "req_http_User_Agent": "%{req.http.User-Agent}V",
        "req_http_X_CDN_Request_ID": "%{req.http.X-CDN-Request-ID}V",
        "req_http_X_Host": "%{req.http.X-Host}V",
        "req_http_X_Owner": "%{req.http.X-Owner}V",
        "req_http_X_Ref": "%{req.http.X-Ref}V",
        "req_http_X_Repo": "%{req.http.X-Repo}V",
        "req_http_X_Static": "%{req.http.X-Static}V",
        "req_http_X_Strain": "%{req.http.X-Strain}V",
        "req_http_X_URL": "%{req.http.X-URL}V",
        "req_http_host": "%v",
        "req_url": "https://%{req.http.X-Host}V%{req.http.X-URL}V",
        "resp_http_Content_Type": "%{resp.http.Content-Type}V",
        "resp_http_X_Version": "%{req.http.X-Version}V",
        "resp_http_x_openwhisk_activation_id": "%{resp.http.x-openwhisk-activation-id}V",
        "server_datacenter": "%{server.datacenter}V",
        "server_region": "%{server.region}V",
        "service_config": "6E6ge7REhiWetPCqy9jht2",
        "status_code": "%>s",
        "time_elapsed_usec": "%{time.elapsed.usec}V",
        "time_end_usec": "%{time.end.usec}V",
        "time_start_usec": "%{time.start.usec}V",
        "vcl_sub": "log-general"
    },
    "name": "helix-logging",
    "project": "helix-225321",
    "service": "6E6ge7REhiWetPCqy9jht2",
    "version": "2"
}
```

### What happens behind the scenes:

- the service creates or updates a Google Cloud Platform service account that corresponds to the service config
- the service creates or rotates the private keys for the service account
- the service creates or updates a Google BigQuery dataset with proper tables
- the service grants permission to the service user to write the Google BigQuery dataset
- the service creates or updates a log configuration in Fastly that sends logs to the above Google BigQuery dataset using the private key and service account from above

## Required Environment Variables

This service depends on three external services to operate:

- Fastly
- Adobe I/O Runtime (only for deployments)
- Google Cloud Platform

It is configured using a number of environment variables that are required for testing (tests that miss required variables will be skipped) and deployment (deployment will fail or be non-functional). These variables are required and this is how to set them up:

### `GOOGLE_CLIENT_EMAIL`

This is the email address associated with a Google Cloud Platform Service account. It looks like `<name>@<project>.iam.gserviceaccount.com`. You can create a proper service account following [the instructions in the Google Cloud Platform documentation](https://cloud.google.com/iam/docs/creating-managing-service-accounts) or this step-by-step guide:

1. Log in to [Google Cloud Platform Console](https://console.cloud.google.com)
2. Select menu → "IAM & admin" → "Service accounts" → "Create service account"
3. Create the service account
4. Add the following roles to the service account:
   * BigQuery Admin
   * Service Account Admin
   * Service Account Key Admin
   * Service Account Key Admin
5. Create a private key in JSON format for the service account and download the key file

**Note:** The private key file and the value of the `GOOGLE_CLIENT_EMAIL` environment variable should be considered private and should never be checked in to source control.

The downloaded file will look something like this:

```json
{
  "type": "service_account",
  "project_id": "project-12345678",
  "private_key_id": "111122223333aaaabbbbccccdddd123412345",
  "private_key": "-----BEGIN PRIVATE KEY-----\n…\n-----END PRIVATE KEY-----\n",
  "client_email": "example-account@project-12345678.iam.gserviceaccount.com",
  "client_id": "111122223333444456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/example-account%40project-12345678.iam.gserviceaccount.com"
}
```

Copy the value of the `client_email` field (e.g. `example-account@project-12345678.iam.gserviceaccount.com`) and save it in the `GOOGLE_CLIENT_EMAIL` environment variable.

### `GOOGLE_PRIVATE_KEY`

This is the private key associated with the Google Cloud Platform Service account created above. In order to retrieve the correct value, see [Creating and Managing Service Account Keys in the Google Cloud Platform documentation](https://cloud.google.com/iam/docs/creating-managing-service-account-keys) or continue the step-by-step guide from above:

6. Make sure you've followed all steps to get the value of `GOOGLE_CLIENT_EMAIL`
7. Copy the value of the `private_key` property in the JSON file you've downloaded

**Note:** The private key and the value of the `GOOGLE_PRIVATE_KEY` environment variable should be considered private and should never be checked in to source control.

The private key is a multi-line value.

**Note:** Private keys created using an API typically have a short expiration time and need to be rotated in regular intervals. Even for private keys that have been created manually, regular rotation is a best practice.

### `GOOGLE_PROJECT_ID`

This is the Google Cloud Platform project ID. It looks like `project-12345678` and you will find it in lots of places in the Google Cloud Platform Console UI. In addition, you can just take the value of the `project_id` property in your downloaded key JSON file.

### `HLX_FASTLY_NAMESPACE`

This property is only required for testing and development. It is the service config ID that you can retrieve from Fastly.

For testing, it is a good idea to use a separate, non-production service config, as the tests not only perform frequent updates, but they also rotate the private keys of the created Google Cloud Platform service accounts. As the tests don't activate the service config, this will lead to an invalid logging configuration in a short time.

### `HLX_FASTLY_AUTH`

This property is only required for testing and development. It is an API token for the Fastly API. Follow the [instructions in the Fastly documentation](https://docs.fastly.com/guides/account-management-and-security/using-api-tokens) to create a token.

The token needs to have `global`, i.e. write access to your service config.


**Note:** The API token and the value of the `HLX_FASTLY_AUTH` environment variable should be considered private and should never be checked in to source control.

### `VERSION_NUM`

This is the version number of a version of the service config above that has been checked out, but has never been activated. This means it is editable.

## Developing Helix Logging

You need `node>=8.0.0` and `npm>=5.4.0`. Follow the typical `npm install`, `npm test` workflow.

[Contributions](CONTRIBUTING.md) are highly welcome.

## Deploying Helix Logging

Deploying Helix Logging requires the `wsk` command-line client, authenticated to a namespace of your choice. For Project Helix, we use the `helix` namespace.

Run `npm run deploy` to do a one-shot deploment of Helix Logging. All commits to `master` that pass the testing will be deployed automatically.
