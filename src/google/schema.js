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
const {
  vcl, str, concat,
} = require('../util/schemahelper');

const schema = {
  client_geo_city: str(vcl`client.geo.city.utf8`),
  client_as_name: str(vcl`client.as.name`),
  client_geo_conn_speed: str(vcl`client.geo.conn_speed`),
  client_geo_continent_code: str(vcl`client.geo.continent_code`),
  client_geo_country_code: str(vcl`client.geo.country_code`),
  client_geo_gmt_offset: str(vcl`client.geo.gmt_offset`),
  client_geo_latitude: str(vcl`client.geo.latitude`),
  client_geo_longitude: str(vcl`client.geo.longitude`),
  client_geo_metro_code: str(vcl`client.geo.metro_code`),
  client_geo_postal_code: str(vcl`client.geo.postal_code`),
  client_geo_region: str(vcl`client.geo.region`),
  client_ip_hashed: str(vcl`digest.hash_sha1(regsuball(req.http.x-forwarded-for, ",.*", ""))`),
  client_ip_masked: str(vcl`regsuball(regsuball(req.http.x-forwarded-for, ",.*", ""), "((\\d+)\\.(\\d+)\\.(\\d+)\\.)(\\d+)", "\\1xxx")`),
  fastly_info_state: str(vcl`fastly_info.state`),
  req_http_X_Ref: str(vcl`req.http.X-Ref`),
  req_http_X_Repo: str(vcl`req.http.X-Repo`),
  req_http_X_Static: str(vcl`req.http.X-Static`),
  req_http_X_Strain: str(vcl`req.http.X-Strain`),
  req_http_X_Owner: str(vcl`req.http.X-Owner`),
  server_datacenter: str(vcl`server.datacenter`),
  server_region: str(vcl`server.region`),
  req_http_host: str('%v'),
  req_http_X_Host: str(vcl`if(req.http.X-Orig-Host, req.http.X-Orig-Host, req.http.Host)`),
  req_url: str(concat(
    'https://',
    vcl`if(req.http.X-Orig-Host, req.http.X-Orig-Host, req.http.Host)}`,
    vcl`if(req.http.X-Orig-URL, req.http.X-Orig-URL, req.url)`,
  )),
  req_http_X_URL: str(vcl`if(req.http.X-Orig-URL, req.http.X-Orig-URL, req.url)`),
  req_http_X_CDN_Request_ID: str(vcl`if(req.http.X-CDN-Request-ID, req.http.X-CDN-Request-ID, randomstr(8, "0123456789abcdef") + "-" + randomstr(4, "0123456789abcdef") + "-" + randomstr(4, "0123456789abcdef") + "-" + randomstr(1, "89ab") + randomstr(3, "0123456789abcdef") + "-" + randomstr(12, "0123456789abcdef"))`),
  vcl_sub: str('log-general'),
  time_start_usec: str(vcl`time.start.usec`),
  time_end_usec: str(vcl`time.end.usec`),
  time_elapsed_usec: str(vcl`time.elapsed.usec`),
  resp_http_x_openwhisk_activation_id: str(vcl`req.http.x-openwhisk-activation-id`),
  resp_http_X_Version: str(vcl`if(req.http.X-Version, req.http.X-Version, regsub(req.vcl, "([^.]+)\\.(\\d+)_(\\d+)-(.*)", "\\2"))`),
  req_http_Referer: str(vcl`req.http.Referer`),
  req_http_User_Agent: str(vcl`req.http.User-Agent`),
  resp_http_Content_Type: str(vcl`resp.http.Content-Type`),
  service_config: str('undefined'),
  status_code: str('%>s'),
};

module.exports = schema;
