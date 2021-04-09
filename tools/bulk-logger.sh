#!/bin/bash
fastly service list | grep skyline | while read line ; do 
  LINE=$(echo $line | grep -o -e " [0-9A-Za-z]* vcl [0-9]* ")
  ID=$(echo $LINE | sed -e "s/ .*//")
  VERSION=$(echo $LINE | sed -e "s/.* //")
  NEWVERSION=$(fastly service-version clone -s $ID --version $VERSION | sed -e "s/.* to version //")
  echo $ID "cloned" $VERSION "=>" $NEWVERSION
  curl -X "POST" "https://helix-pages.anywhere.run/helix-services/logging@v1" \
     -H 'Content-Type: application/x-www-form-urlencoded; charset=utf-8' \
     --data-urlencode "service=$ID" \
     --data-urlencode "version=$NEWVERSION" \
     --data-urlencode "token=$HLX_FASTLY_AUTH" \
     --data-urlencode "coralogixapp=fastly" \
     --data-urlencode "coralogixkey=$CORALOGIX_TOKEN" \
     --data-urlencode "splunkhost=https://splunk-hec-ext.adobe.net/services/collector" \
     --data-urlencode "splunkauth=$SPLUNK_AUTH"
  echo ""
  fastly service-version activate -s $ID --version $NEWVERSION
done