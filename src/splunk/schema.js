/*
 * Copyright 2021 Adobe. All rights reserved.
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
  vcl, str,
} = require('../util/schemahelper');

const schema = {
  time: vcl`time.start.msec`,
  host: str(vcl`cstr_escape(req.http.fastly-orig-host)`),
  index: str`dx_aem_engineering`,
  sourcetype: str`cdn`,
  event: {
    service_id: str(vcl`req.service_id`),
    // we are using the helix request id, if available
    'x-rid': str(vcl`if(req.http.X-CDN-Request-ID, req.http.X-CDN-Request-ID, randomstr(8, "0123456789abcdef") + "-" + randomstr(4, "0123456789abcdef") + "-" + randomstr(4, "0123456789abcdef") + "-" + randomstr(1, "89ab") + randomstr(3, "0123456789abcdef") + "-" + randomstr(12, "0123456789abcdef"))`),
    time_start: str(vcl`strftime({"%Y-%m-%dT%H:%M:%S%Z"}, time.start)`),
    time_end: str(vcl`strftime({"%Y-%m-%dT%H:%M:%S%Z"}, time.end)`),
    time_elapsed: vcl`time.elapsed.usec`,
    client_ip: str(vcl`req.http.Fastly-Client-IP`),
    client_as_name: str(vcl`client.as.name`),
    client_as_number: str(vcl`client.as.number`),
    client_connection_speed: str(vcl`client.geo.conn_speed`),
    request: str(vcl`req.request`),
    protocol: str(vcl`req.proto`),
    origin_host: str(vcl`req.http.host`),
    url: str(vcl`cstr_escape(req.url)`),
    is_ipv6: str(vcl`if(req.is_ipv6, "true", "false")`),
    is_tls: str(vcl`if(req.is_ssl, "true", "false")`),
    tls_client_protocol: str(vcl`cstr_escape(tls.client.protocol)`),
    tls_client_servername: str(vcl`cstr_escape(tls.client.servername)`),
    tls_client_cipher: str(vcl`cstr_escape(tls.client.cipher)`),
    tls_client_cipher_sha: str(vcl`cstr_escape(tls.client.ciphers_sha )`),
    tls_client_tlsexts_sha: str(vcl`cstr_escape(tls.client.tlsexts_sha)`),
    is_h2: str(vcl`if(fastly_info.is_h2, "true", "false")`),
    is_h2_push: str(vcl`if(fastly_info.h2.is_push, "true", "false")`),
    h2_stream_id: str(vcl`fastly_info.h2.stream_id`),
    request_referer: str(vcl`cstr_escape(req.http.referer)`),
    request_user_agent: str(vcl`cstr_escape(req.http.user-agent)`),
    request_accept_content: str(vcl`cstr_escape(req.http.accept)`),
    request_accept_language: str(vcl`cstr_escape(req.http.accept-language)`),
    request_accept_encoding: str(vcl`cstr_escape(req.http.accept-encoding)`),
    request_accept_charset: str(vcl`cstr_escape(req.http.accept-charset)`),
    request_connection: str(vcl`cstr_escape(req.http.connection)`),
    request_dnt: str(vcl`cstr_escape(req.http.dnt)`),
    request_forwarded: str(vcl`cstr_escape(req.http.forwarded)`),
    request_via: str(vcl`cstr_escape(req.http.via)`),
    request_cache_control: str(vcl`cstr_escape(req.http.cache-control)`),
    request_x_requested_with: str(vcl`cstr_escape(req.http.x-requested-with)`),
    request_x_att_device_id: str(vcl`cstr_escape(req.http.x-att-device-id)`),
    request_x_forwarded_for: str(vcl`cstr_escape(req.http.x-forwarded-for)`),
    status: str(vcl`resp.status`),
    content_type: str(vcl`cstr_escape(resp.http.content-type)`),
    // cache_status: str(vcl`regsub(fastly_info.state, "^(HIT-(SYNTH)|(HITPASS|HIT|MISS|PASS|ERROR|PIPE)).*", "\2\3")`),
    is_cacheable: str(vcl`if(fastly_info.state ~"^(HIT|MISS)$", "true", "false")`),
    response_age: str(vcl`cstr_escape(resp.http.age)`),
    response_cache_control: str(vcl`cstr_escape(resp.http.cache-control)`),
    response_expires: str(vcl`cstr_escape(resp.http.expires)`),
    response_last_modified: str(vcl`cstr_escape(resp.http.last-modified)`),
    response_tsv: str(vcl`cstr_escape(resp.http.tsv)`),
    server_datacenter: str(vcl`server.datacenter`),
    server_ip: str(vcl`server.ip`),
    geo_city: str(vcl`client.geo.city.utf8`),
    geo_country_code: str(vcl`client.geo.country_code`),
    geo_continent_code: str(vcl`client.geo.continent_code`),
    geo_region: str(vcl`client.geo.region`),
    req_header_size: str(vcl`req.header_bytes_read`),
    req_body_size: str(vcl`req.body_bytes_read`),
    resp_header_size: str(vcl`resp.header_bytes_written`),
    resp_body_size: str(vcl`resp.body_bytes_written`),
    socket_cwnd: str(vcl`client.socket.cwnd`),
    socket_nexthop: str(vcl`client.socket.nexthop`),
    socket_tcpi_rcv_mss: str(vcl`client.socket.tcpi_rcv_mss`),
    socket_tcpi_snd_mss: str(vcl`client.socket.tcpi_snd_mss`),
    socket_tcpi_rtt: str(vcl`client.socket.tcpi_rtt`),
    socket_tcpi_rttvar: str(vcl`client.socket.tcpi_rttvar`),
    socket_tcpi_rcv_rtt: str(vcl`client.socket.tcpi_rcv_rtt`),
    socket_tcpi_rcv_space: str(vcl`client.socket.tcpi_rcv_space`),
    socket_tcpi_last_data_sent: str(vcl`client.socket.tcpi_last_data_sent`),
    socket_tcpi_total_retrans: str(vcl`client.socket.tcpi_total_retrans`),
    socket_tcpi_delta_retrans: str(vcl`client.socket.tcpi_delta_retrans`),
    socket_ploss: str(vcl`client.socket.ploss`),
  },
};

module.exports = schema;
