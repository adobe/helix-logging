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
        concat('https://', vcl`req.http.host`, vcl`cstr_escape(req.url)`),
      ),
      service_id: str(vcl`req.service_id`),
      version: str(vcl`req.http.X-Version`),
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
          vcl`regsuball(req.http.X-Forwarded-For, "((\\d+)\\.(\\d+)\\.(\\d+)\\.)(\\d+)", "\\1xxx")`,
        ),
      },
      request: {
        id: str(vcl`req.http.X-CDN-Request-ID`),
        method: str('%m'),
        protocol: str(vcl`if(fastly_info.is_h2, "HTTP/2", "HTTP/1.1")`),
        h2: vcl`if(fastly_info.is_h2, "true", "false")`,
        h2_push: vcl`if(fastly_info.h2.is_push, "true", "false")`,
        is_ipv6: vcl`if(req.is_ipv6, "true", "false")`,
        h2_stream_id: str(vcl`fastly_info.h2.stream_id`),
        url: str(vcl`cstr_escape(req.url)`),
        referer: req`Referer`,
        user_agent: req`User-Agent`,
        accept_content: req`Accept`,
        accept_language: req`Accept-Language`,
        accept_encoding: req`Accept-Encoding`,
        accept_charset: req`Accept-Charset`,
        connection: req`Connection`,
        dnt: req`DNT`,
        forwarded: req`forwarded`,
        via: req`Via`,
        cache_control: req`Cache-Control`,
        x_requested_with: req`X-Requested-With`,
        header_size: vcl`req.header_bytes_read`,
        body_size: vcl`req.body_bytes_read`,
      },
      origin: {
        host: str('%v'),
        url: str(vcl`req.http.x-backend-url`),
      },
      helix: {
        strain: str(vcl`req.http.X-Strain`),
        type: str(vcl`req.http.X-Request-Type`),
      },
      response: {
        status: str('%s'),
        content_type: res`Content-Type`,
        age: res`Age`,
        cache_control: res`Cache-Control`,
        expires: res`Expires`,
        last_modified: res`Last-Modified`,
        tsv: res`TSV`,
        header_size: vcl`resp.header_bytes_written`,
        body_size: '%B',
      },
      edge: {
        cache_status: str(
          vcl`regsub(fastly_info.state, "^(HIT-(SYNTH)|(HITPASS|HIT|MISS|PASS|ERROR|PIPE)).*", "\\\\2\\\\3")`,
        ),
        is_cacheable: vcl`if(fastly_info.state ~"^(HIT|MISS)$", "true", "false")`,
        datacenter: str(vcl`server.datacenter`),
        ip: str('%A'),
      },
      socket: {
        cwnd: vcl`client.socket.cwnd`,
        nexthop: str(vcl`client.socket.nexthop`),
        tcpi_rcv_mss: vcl`client.socket.tcpi_rcv_mss`,
        tcpi_snd_mss: vcl`client.socket.tcpi_snd_mss`,
        tcpi_rtt: vcl`client.socket.tcpi_rtt`,
        tcpi_rttvar: vcl`client.socket.tcpi_rttvar`,
        tcpi_rcv_rtt: vcl`client.socket.tcpi_rcv_rtt`,
        tcpi_rcv_space: vcl`client.socket.tcpi_rcv_space`,
        tcpi_last_data_sent: vcl`client.socket.tcpi_last_data_sent`,
        tcpi_total_retrans: vcl`client.socket.tcpi_total_retrans`,
        tcpi_delta_retrans: vcl`client.socket.tcpi_delta_retrans`,
        ploss: vcl`client.socket.ploss`,
      },
    },
  },
};

module.exports = schema;
