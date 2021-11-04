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
  vcl, time, req, res, str, concat,
} = require('@adobe/fastly-native-promises').loghelpers;

const schema = {
  timestamp: vcl`time.start.msec`,
  applicationName: str('fastly'),
  subsystemName: str(vcl`req.service_id`),
  severity: concat(
    vcl`if(resp.status<400, "3", "")`,
    vcl`if(resp.status>=400 && resp.status<500, "4", "")`,
    vcl`if(resp.status>=500, "5", "")`,
  ),
  json: {
    cdn: {
      service_id: str(vcl`req.service_id`),
      version: str(vcl`req.vcl.version`),
      url: str(
        concat('https://', vcl`req.http.host`, vcl`cstr_escape(if(req.http.X-Orig-Url, req.http.X-Orig-Url, req.url))`),
      ),
      originating_ip: str(
        vcl`regsuball(req.http.x-forwarded-for, ",.*", "")`,
      ),
      fastly_client_ip: req`Fastly-Client-IP`,
      time: {
        start: str(
          concat(
            time`begin:%Y-%m-%dT%H:%M:%S`,
            '.',
            time`begin:msec_frac`,
            time`begin:%z`,
          ),
        ),
        start_msec: vcl`time.start.msec`,
        end: str(
          concat(
            time`end:%Y-%m-%dT%H:%M:%S`,
            '.',
            time`end:msec_frac`,
            time`end:%z`,
          ),
        ),
        end_msec: vcl`time.end.msec`,
        elapsed: '%D',
      },
      is_edge: vcl`if(fastly.ff.visits_this_service == 0, "true", "false")`,
      visits_this_service: vcl`fastly.ff.visits_this_service`,
      fastly_ff: req`Fastly-FF`,
      datacenter: str(vcl`server.datacenter`),
      hostname: str(vcl`server.hostname`),
      ip: str('%A'),
      region_code: str(vcl`server.region`),
      is_cacheable: vcl`if(fastly_info.state ~"^(HIT|MISS)(?:-|$)", "true", "false")`,
      cache_status: str(vcl`fastly_info.state`),
      is_h2: vcl`if(fastly_info.is_h2, "true", "false")`,
      is_h2_push: vcl`if(fastly_info.h2.is_push, "true", "false")`,
      fastly_error: str(vcl`fastly.error`),
    },
    client: {
      name: str(vcl`client.as.name`),
      number: vcl`client.as.number`,
      location_geopoint: {
        lat: vcl`client.geo.latitude`,
        lon: vcl`client.geo.longitude`,
      },
      city_name: str(vcl`client.geo.city.ascii`),
      country_name: str(vcl`client.geo.country_name.ascii`),
      connection_speed: str(vcl`client.geo.conn_speed`),
      ip: str(vcl`client.ip`),
    },
    request: {
      method: str('%m'),
      host: req`Host`,
      url: str(vcl`cstr_escape(if(req.http.X-Orig-Url, req.http.X-Orig-Url, req.url))`),
      protocol: str('%H'),
      is_ipv6: vcl`if(req.is_ipv6, "true", "false")`,
      backend: str(vcl`regsuball(req.backend, "^.*--F_", "")`),
      header_size: vcl`req.header_bytes_read`,
      body_size: vcl`req.body_bytes_read`,
      headers: {
        referer: req`Referer`,
        user_agent: req`User-Agent`,
        accept_content: req`Accept`,
        accept_language: req`Accept-Language`,
        accept_encoding: req`Accept-Encoding`,
        accept_charset: req`Accept-Charset`,
        if_modified_since: req`If-Modified-Since`,
        connection: req`Connection`,
        forwarded: req`Forwarded`,
        cdn_loop: req`CDN_Loop`,
        via: req`Via`,
        cache_control: req`Cache-Control`,
        x_forwarded_host: req`X-Forwarded-Host`,
        x_forwarded_for: req`X-Forwarded-For`,
      },
    },
    response: {
      status: str('%s'),
      header_size: vcl`resp.header_bytes_written`,
      body_size: '%B',
      headers: {
        content_type: res`Content-Type`,
        content_encoding: res`Content-Encoding`,
        age: res`Age`,
        cache_control: res`Cache-Control`,
        expires: res`Expires`,
        last_modified: res`Last-Modified`,
        vary: res`Vary`,
        surrogate_key: str(vcl`resp.http.Surrogate-Key`),
        cdn_cache_control: str(vcl`resp.http.CDN-Cache-Control`),
        surrogate_control: str(vcl`resp.http.Surrogate-Control`),
        edge_control: str(vcl`resp.http.Edge-Control`),
        x_robots_tag: str(vcl`resp.http.X-Robots-Tag`),
        x_error: str(vcl`resp.http.X-Error`),
        fastly_io_error: str(vcl`resp.http.Fastly-IO-Error`),
        fastly_io_warning: str(vcl`resp.http.Fastly-IO-Warning`),
        fastly_io_info: str(vcl`resp.http.Fastly-IO-Info`),
      },
    },
  },
};

module.exports = schema;
