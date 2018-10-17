# Logger set-up in Fastly
 

**Note:** This documentation is still work in progress.
---

### The action

The file that is executed is `logger.py`, hence check the following are met:   
*  Make sure it's executable (`chmod a+x logger.py`).
*  Make sure it's got the  shebang on line one.
*  Make sure it runs locally.   
   *  e.g. `./logger.py '{"tart":"tarty"}'`    
      produces the JSON dictionary:    
      `{"allparams": {"tart": "tarty", "myparam": "myparam default"}}`


### The Dockerfile

Compare the following with the supplied `Dockerfile` supplied by `$ wsk sdk install docker` to take the Python script `test.py` and make it ready to build the docker image.  

Hopefully the comments explain the differences. Any assets (data files or modules) in the current directory will become part of the image as will any Python dependencies listed in `requirements.txt`

```bash
# Dockerfile for Python whisk docker action
FROM openwhisk/dockerskeleton

ENV FLASK_PROXY_PORT 8080

# Install our action's Python dependencies
ADD requirements.txt /action/requirements.txt
RUN cd /action; pip install -r requirements.txt

# Ensure source assets are not drawn from the cache 
# after this date
ENV REFRESHED_AT 2016-09-05T13:59:39Z
# Add all source assets
ADD . /action
# Rename our executable Python action
ADD test.py /action/exec

# Leave CMD as is for Openwhisk
CMD ["/bin/bash", "-c", "cd actionProxy && python -u actionproxy.py"]
```

Note the `ENV REFRESHED_AT ...` which I used to make sure that an updated `test.py` was picked up afresh rather than being drawn from the cache when the image is built.

## Build and push to Artifactory

```bash
./buildAndPush.sh helix/log-setup:0.1.0
```

In the above command, `helix/log-setup:0.1.0` is the name and tag of the local docker image that will be built.


The `buildAndPush.sh` script does the following:
* Logs in to Artifactory
* Builds the Docker image, using the local `Dockerfile` 
* Pushes the image to Artifactory
* Prepares the OpenWhisk environment
* Creates OpenWhisk action `hlx-log` 


# Setting up the development environment

For development, you can set up the development environment on your laptop.
We're using `python3`.

The first step is creating a virtual environment:
```
# Set up virtualenv.
virtualenv -p /usr/local/bin/python venv
source venv/bin/activate

# Install requirements.
pip install -r requirements.txt 
pip install -r requirements_tests.txt
```


### Running the tests

Tests mock API calls to both AWS and Faslty.
Run the following command in the root directory, for running the tests:  
```
(venv) helix(master) $ nosetests
.
----------------------------------------------------------------------
Ran 1 test in 2.139s

OK
```

