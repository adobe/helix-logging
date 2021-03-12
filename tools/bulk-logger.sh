#!/bin/bash
fastly service list | grep .live | while read line ; do 
  LINE=$(echo $line | grep -o -e " [0-9A-Za-z]* vcl [0-9]* ")
  ID=$(echo $LINE | sed -e "s/ .*//")
  VERSION=$(echo $LINE | sed -e "s/.* //")
  NEWVERSION=$(fastly service-version clone -s $ID --version $VERSION | sed -e "s/.* to version //")
  echo $ID "cloned" $VERSION "=>" $NEWVERSION
  echo curl -X "POST" "https://helix-pages.anywhere.run/helix-services/logging@v1" \
        -H 'Content-Type: application/json; charset=utf-8' \
        -d $'{
      "service": "'$ID'",
      "coralogixapp": "fastly",
      "coralogixkey": "'$CORALOGIX_TOKEN'",
      "splunkhost": "https://splunk-hec-ext.adobe.net/services/collector",
      "version": '$NEWVERSION',
      "token": "'$FASTLY_AUTH'",
      "splunkauth": "'$SPLUNK_AUTH'"
    }'
  fastly service-version activate -s $ID --version $NEWVERSION
done