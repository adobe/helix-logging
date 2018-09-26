#!/usr/bin/env python

import json
import sys

from logger_setup import LoggerSetup


def main():
    # Accept multiple '--param's
    params = json.loads(sys.argv[1])
    sys.stdout.write('Init works, at least\n')

    namespace = params.get('namespace')
    if not namespace:
        print(json.dumps({'error': 'Make request by adding namespace!'}))

    version = params.get('version')
    if not version:
        print(json.dumps({'error': 'Make request by adding version!'}))

    # Set up class that's later used for setting up logging.
    logger_setup = LoggerSetup('')
    logger_setup.set_up_logging(namespace, version)

    # output result of this action
    print(json.dumps({ 'allparams' : params}))


if __name__ == "__main__":
    main()
