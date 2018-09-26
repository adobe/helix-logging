# Dockerfile for Python whisk docker action
FROM openwhisk/dockerskeleton

ENV FLASK_PROXY_PORT 8080

# Install our action's Python dependencies
ADD requirements.txt /action/requirements.txt
RUN cd /action; pip install -r requirements.txt

# Add all source assets
ADD . /action

# Add the helper file that sets up logging.
ADD logger_setup.py /action/logger_setup.py

# Rename our executable Python action
ADD logger.py /action/exec

# Leave CMD as is for Openwhisk
CMD ["/bin/bash", "-c", "cd actionProxy && python -u actionproxy.py"]