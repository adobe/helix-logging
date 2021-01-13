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
  host: vcl`cstr_escape(req.http.fastly-orig-host)`,
  index: str`dx_aem_engineering`,
  sourcetype: str`cdn`,
  event: {
    service_id: vcl`req.service_id`,
    'x-rid': vcl`req.http.x-rid`,
    time_start: vcl`strftime({"%Y-%m-%dT%H:%M:%S%Z"}, time.start)`,
    time_end: vcl`strftime({"%Y-%m-%dT%H:%M:%S%Z"}, time.end)`,
    time_elapsed: vcl`time.elapsed.usec`,
    client_ip: vcl`req.http.Fastly-Client-IP`,
    client_as_name: vcl`client.as.name`,
    client_as_number: vcl`client.as.number`,
    client_connection_speed: vcl`client.geo.conn_speed`,
    request: vcl`req.request`,
    protocol: vcl`req.proto`,
    origin_host: vcl`req.http.host`,
    url: vcl`cstr_escape(req.url)`,
    is_ipv6: vcl`if(req.is_ipv6, "true", "false")`,
    is_tls: vcl`if(req.is_ssl, "true", "false")`,
    tls_client_protocol: vcl`cstr_escape(tls.client.protocol)`,
    tls_client_servername: vcl`cstr_escape(tls.client.servername)`,
    tls_client_cipher: vcl`cstr_escape(tls.client.cipher)`,
    tls_client_cipher_sha: vcl`cstr_escape(tls.client.ciphers_sha )`,
    tls_client_tlsexts_sha: vcl`cstr_escape(tls.client.tlsexts_sha)`,
    is_h2: vcl`if(fastly_info.is_h2, "true", "false")`,
    is_h2_push: vcl`if(fastly_info.h2.is_push, "true", "false")`,
    h2_stream_id: vcl`fastly_info.h2.stream_id`,
    request_referer: vcl`cstr_escape(req.http.referer)`,
    request_user_agent: vcl`cstr_escape(req.http.user-agent)`,
    request_accept_content: vcl`cstr_escape(req.http.accept)`,
    request_accept_language: vcl`cstr_escape(req.http.accept-language)`,
    request_accept_encoding: vcl`cstr_escape(req.http.accept-encoding)`,
    request_accept_charset: vcl`cstr_escape(req.http.accept-charset)`,
    request_connection: vcl`cstr_escape(req.http.connection)`,
    request_dnt: vcl`cstr_escape(req.http.dnt)`,
    request_forwarded: vcl`cstr_escape(req.http.forwarded)`,
    request_via: vcl`cstr_escape(req.http.via)`,
    request_cache_control: vcl`cstr_escape(req.http.cache-control)`,
    request_x_requested_with: vcl`cstr_escape(req.http.x-requested-with)`,
    request_x_att_device_id: vcl`cstr_escape(req.http.x-att-device-id)`,
    request_x_forwarded_for: vcl`cstr_escape(req.http.x-forwarded-for)`,
    status: vcl`resp.status`,
    content_type: vcl`cstr_escape(resp.http.content-type)`,
    cache_status: vcl`regsub(fastly_info.state, "^(HIT-(SYNTH)|(HITPASS|HIT|MISS|PASS|ERROR|PIPE)).*", "\2\3")`,
    is_cacheable: vcl`if(fastly_info.state ~"^(HIT|MISS)$", "true", "false")`,
    response_age: vcl`cstr_escape(resp.http.age)`,
    response_cache_control: vcl`cstr_escape(resp.http.cache-control)`,
    response_expires: vcl`cstr_escape(resp.http.expires)`,
    response_last_modified: vcl`cstr_escape(resp.http.last-modified)`,
    response_tsv: vcl`cstr_escape(resp.http.tsv)`,
    server_datacenter: vcl`server.datacenter`,
    server_ip: vcl`server.ip`,
    geo_city: vcl`client.geo.city.utf8`,
    geo_country_code: vcl`client.geo.country_code`,
    geo_continent_code: vcl`client.geo.continent_code`,
    geo_region: vcl`client.geo.region`,
    req_header_size: vcl`req.header_bytes_read`,
    req_body_size: vcl`req.body_bytes_read`,
    resp_header_size: vcl`resp.header_bytes_written`,
    resp_body_size: vcl`resp.body_bytes_written`,
    socket_cwnd: vcl`client.socket.cwnd`,
    socket_nexthop: vcl`client.socket.nexthop`,
    socket_tcpi_rcv_mss: vcl`client.socket.tcpi_rcv_mss`,
    socket_tcpi_snd_mss: vcl`client.socket.tcpi_snd_mss`,
    socket_tcpi_rtt: vcl`client.socket.tcpi_rtt`,
    socket_tcpi_rttvar: vcl`client.socket.tcpi_rttvar`,
    socket_tcpi_rcv_rtt: vcl`client.socket.tcpi_rcv_rtt`,
    socket_tcpi_rcv_space: vcl`client.socket.tcpi_rcv_space`,
    socket_tcpi_last_data_sent: vcl`client.socket.tcpi_last_data_sent`,
    socket_tcpi_total_retrans: vcl`client.socket.tcpi_total_retrans`,
    socket_tcpi_delta_retrans: vcl`client.socket.tcpi_delta_retrans`,
    socket_ploss: vcl`client.socket.ploss`,
  },
};

module.exports = schema;
