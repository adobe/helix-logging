# Logging

### Fastly to CosmosDB

Fastly dumps access logs to S3, at a configured time interval. Once S3 files are written in S3, a Lambda function is called that reads these S3 files and writes each log entry in CosmosDB.

```
Fastly ━━━━━▶ S3 ━━━━━▶ Lambda ━━━━━▶ CosmosDB
```

### Lambda function

The function acts as a glue code, moving data from S3 to CosmosDB.

Lambda function code can exist in the browser, be uploaded as a zip archive or exist in an S3 file.

##### Creating the zip from scratch

All code needed to build the archive can be found in the `lambda` directory.

```
cd lambda

# Create & activate a virtual environment
virtualenv -p /usr/bin/python2.7 venv
source venv/bin/activate

# Install requirements.
# Note that any new package that is being used in the lambda function needs to be part of
# the zip archive.
pip install -r requirements.txt

# Build the archive.
cd venv/lib/python2.7/site-packages
zip -r9 ../../../../S3ToCosmos.zip *
cd -
zip -g S3ToCosmos.zip lambda_function.py

# Deactivate virtual environment.
deactivate
```

Now the archive can be uploaded as the Lambda function code.

