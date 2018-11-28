from __future__ import print_function

import json
import urllib
import urlparse
import os

import boto3
import pymongo

# Note that AWS_ACCESS_KEY and AWS_SECRET_ACCESS_KEY should be environment
# variables that are automatically set up in the Lambda function environment.
# https://docs.aws.amazon.com/lambda/latest/dg/current-supported-versions.html#lambda-environment-variables
# However, they are not....
AWS_KEY = os.environ['AWS_KEY']
AWS_SECRET = os.environ['AWS_SECRET']
COSMOS_DB_URI = os.environ['COSMOS_DB_URI']

s3 = boto3.client('s3', aws_access_key_id=AWS_KEY, aws_secret_access_key=AWS_SECRET)
cosmos_db = pymongo.MongoClient(COSMOS_DB_URI)


def build_json_log_entry(customer_id, log_entry):
    print("Got log entry: {}".format(log_entry))
    return {}
    # url_query = url['urlquery']
    # if not url_query:
    #     return
    #
        # if url_query.startswith('?'):
    #     url_query = url_query[1:]
    #
    # query_params = dict(urlparse.parse_qsl(url_query))
    #
    # url['urlquery_dict'] = query_params


def lambda_handler(event, context):
    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.unquote_plus(event['Records'][0]['s3']['object']['key'].encode('utf8'))
    customer_id = key.split('/', 1)[0]

    # Get S3 object
    try:
        s3_object = s3.get_object(Bucket=bucket, Key=key)
        print("Got S3 file")
    except Exception as e:
        print(r'Could not process file: {} from .'.format(key, bucket))
        raise e

    # Get and extract body
    stream_object = s3_object['Body']
    data = stream_object.read().decode("utf-8")
    log_entries = [item for item in data.split('\n') if item]

    for log_entry in log_entries:

        # Annotate json_log.
        json_log = build_json_log_entry(customer_id, log_entry)

        # Write log to CosmosDB
        try:
            cosmos_db.cdn.data.insert(json_log)
        except Exception as e:
            print('Could not insert log in cosmos: {}'.format(json_log))
            raise e

    # Remove S3 file after processing has been done
    s3.delete_object(Bucket=bucket, Key=key)
