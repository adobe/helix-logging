#!/bin/bash
#
# This script will build the docker image and push it to Artifactory.
#
# Usage:
# ./buildAndPush.sh burtica/log-setup:0.1.0
#
#

# Login to Artifactory.
echo "Logging in to Artifactory"
export DOCKER_OPTS+="--insecure-registry docker-senseiwins-release.dr-uw2.adobeitc.com"
docker login -u burtica docker-senseiwins-release.dr-uw2.adobeitc.com
echo "======================================================================"

# Get the image name
IMAGE_NAME=$1
echo "Using $IMAGE_NAME as the image name"
echo "======================================================================"

# Make the docker image
docker build -t $IMAGE_NAME .
if [ $? -ne 0 ]; then
    echo "Failed to build Docker"
    exit
fi
echo "======================================================================"

# Tag image.
docker tag $IMAGE_NAME docker-senseiwins-release.dr-uw2.adobeitc.com/$IMAGE_NAME

docker push docker-senseiwins-release.dr-uw2.adobeitc.com/$IMAGE_NAME
if [ $? -ne 0 ]; then
    echo "Failed to push Docker container"
    exit
fi
echo "======================================================================"


# Create OpenWhisk action.
wsk property set --apihost runtime.adobe.io --namespace $ADOBE_RUNTIME_NAMESPACE --auth $ADOBE_RUNTIME_AUTH
wsk action create hlx-log --docker docker-senseiwins-release.dr-uw2.adobeitc.com/$IMAGE_NAME
if [ $? -ne 0 ]; then
    echo "Failed creating OpenWhisk action"
    exit
fi
echo "======================================================================"


# Print OpenWhisk actions.
wsk action list