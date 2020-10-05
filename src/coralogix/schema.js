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
} = require('../util/schemahelper');

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
    ow: {
      activationId: str(vcl`req.http.x-openwhisk-activation-id`),
    },
    cdn: {
      url: str(
        concat('https://', vcl`req.http.host`, vcl`cstr_escape(if(req.http.X-Orig-Url, req.http.X-Orig-Url, req.url))`),
      ),
      service_id: str(vcl`req.service_id`),
      version: str(vcl`if(req.http.X-Version, req.http.X-Version, regsub(req.vcl, "([^.]+)\\.(\\d+)_(\\d+)-(.*)", "\\2"))`),
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
        ip: str(
          vcl`regsuball(req.http.x-forwarded-for, ",.*", "")`,
        ),
      },
      request: {
        id: str(vcl`if(req.http.X-CDN-Request-ID, req.http.X-CDN-Request-ID, randomstr(8, "0123456789abcdef") + "-" + randomstr(4, "0123456789abcdef") + "-" + randomstr(4, "0123456789abcdef") + "-" + randomstr(1, "89ab") + randomstr(3, "0123456789abcdef") + "-" + randomstr(12, "0123456789abcdef"))`),
        method: str('%m'),
        protocol: str(vcl`if(fastly_info.is_h2, "HTTP/2", "HTTP/1.1")`),
        h2: vcl`if(fastly_info.is_h2, "true", "false")`,
        h2_push: vcl`if(fastly_info.h2.is_push, "true", "false")`,
        is_ipv6: vcl`if(req.is_ipv6, "true", "false")`,
        url: str(vcl`cstr_escape(if(req.http.X-Orig-Url, req.http.X-Orig-Url, req.url))`),
        referer: req`Referer`,
        user_agent: req`User-Agent`,
        accept_content: req`Accept`,
        accept_language: req`Accept-Language`,
        accept_encoding: req`Accept-Encoding`,
        accept_charset: req`Accept-Charset`,
        connection: req`Connection`,
        forwarded: req`forwarded`,
        via: req`Via`,
        cache_control: req`Cache-Control`,
        header_size: vcl`req.header_bytes_read`,
        body_size: vcl`req.body_bytes_read`,
      },
      origin: {
        host: str('%v'),
        url: str(vcl`if(req.http.x-backend-url, req.http.x-backend-url, req.url)`),
      },
      helix: {
        strain: str(vcl`if(req.http.X-Strain, req.http.X-Strain, "Outer-CDN")`),
        type: str(vcl`if(req.http.X-Request-Type, req.http.X-Request-Type, "Outer-CDN")`),
      },
      response: {
        status: str('%s'),
        content_type: res`Content-Type`,
        age: res`Age`,
        cache_control: res`Cache-Control`,
        expires: res`Expires`,
        last_modified: res`Last-Modified`,
        header_size: vcl`resp.header_bytes_written`,
        body_size: '%B',
      },
      edge: {
        cache_status: str(vcl`fastly_info.state`),
        datacenter: str(vcl`server.datacenter`),
        ip: str('%A'),
      },
      vcl_trace: str(vcl`req.http.x-trace`),
    },
  },
};

module.exports = schema;
