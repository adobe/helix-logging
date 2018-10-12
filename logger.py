#!/usr/bin/env python

import json
import sys

from logger_setup import LoggerSetup


def main():
    # Extract the provided params.
    params = json.loads(sys.argv[1])

    # Extract keys and secrets needed further.
    aws_key = params.pop('aws_key', None)
    aws_secret = params.pop('aws_secret', None)
    fastly_key = params.pop('fastly_key', None)

    fastly_namespace = params.get('fastly_namespace')
    if not fastly_namespace:
        sys.stdout.write('[Params] Received the following params: {}, {}, {}, {}\n'.format(
            aws_key,
            aws_secret,
            fastly_key,
            params)
        )
        print(json.dumps({'error': 'Make request by adding namespace!'}))

    fastly_version = params.get('fastly_version')
    if not fastly_version:
        print(json.dumps({'error': 'Make request by adding version!'}))

    # Set up class that's later used for setting up logging.
    try:
        logger_setup = LoggerSetup(fastly_key, aws_key, aws_secret)
        logger_setup.set_up_logging(fastly_namespace, fastly_version)
    except Exception as exception:
        print(json.dumps({'error': 'ceva'}))

    # output result of this action
    print(json.dumps({'allparams': params}))


if __name__ == "__main__":
    main()
