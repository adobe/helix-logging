/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
const schema = {
  client_geo_city: '%{client.geo.city.utf8}V',
  client_as_name: '%{client.as.name}V',
  client_geo_conn_speed: '%{client.geo.conn_speed}V',
  client_geo_continent_code: '%{client.geo.continent_code}V',
  client_geo_country_code: '%{client.geo.country_code}V',
  client_geo_gmt_offset: '%{client.geo.gmt_offset}V',
  client_geo_latitude: '%{client.geo.latitude}V',
  client_geo_longitude: '%{client.geo.longitude}V',
  client_geo_metro_code: '%{client.geo.metro_code}V',
  client_geo_postal_code: '%{client.geo.postal_code}V',
  client_geo_region: '%{client.geo.region}V',
  client_ip_hashed: '%{digest.hash_sha1(regsuball(req.http.x-forwarded-for, ",.*", ""))}V',
  client_ip_masked: '%{regsuball(regsuball(req.http.x-forwarded-for, ",.*", ""), "((\\d+)\\.(\\d+)\\.(\\d+)\\.)(\\d+)", "\\1xxx")}V',
  fastly_info_state: '%{fastly_info.state}V',
  req_http_X_Ref: '%{req.http.X-Ref}V',
  req_http_X_Repo: '%{req.http.X-Repo}V',
  req_http_X_Static: '%{req.http.X-Static}V',
  req_http_X_Strain: '%{req.http.X-Strain}V',
  req_http_X_Owner: '%{req.http.X-Owner}V',
  server_datacenter: '%{server.datacenter}V',
  server_region: '%{server.region}V',
  req_http_host: '%v',
  req_http_X_Host: '%{req.http.X-Orig-Host}V',
  req_url: 'https://%{req.http.X-Orig-Host}V%{req.http.X-Orig-URL}V',
  req_http_X_URL: '%{req.http.X-Orig-URL}V',
  req_http_X_CDN_Request_ID: '%{req.http.X-CDN-Request-ID}V',
  vcl_sub: 'log-general',
  time_start_usec: '%{time.start.usec}V',
  time_end_usec: '%{time.end.usec}V',
  time_elapsed_usec: '%{time.elapsed.usec}V',
  resp_http_x_openwhisk_activation_id: '%{req.http.x-openwhisk-activation-id}V',
  resp_http_X_Version: '%{req.http.X-Version}V',
  req_http_Referer: '%{req.http.Referer}V',
  req_http_User_Agent: '%{req.http.User-Agent}V',
  resp_http_Content_Type: '%{resp.http.Content-Type}V',
  service_config: 'undefined',
  status_code: '%>s',
};

module.exports = schema;
