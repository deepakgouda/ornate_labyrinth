---
title: A-Z AWS Lambda funtions and OpenCV 
author: Deepak
date: 2021-02-07
hero: ./images/diamond.jpg
excerpt: Setting up an AWS lambda function and run an image processing operation.
---
## What is an AWS Lambda function?
AWS lambda is a service offered under [AWS free tier](https://aws.amazon.com/free) that can be used to run a backend service without explicitly allocating or managing servers. Basically a function can be defined in one of the [supported languages](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) along with the dependencies and infrastructure maintenance, scaling, resource allocation and logging will be taken care of. Currently, AWS free tier allows upto 1 Million requests per month.

The procedure to setup an image processing operation has been documented here. The lambda function has been written in Python 3.7 and the image processing library used in OpenCV 4.3.

## Creating Account, user and admin groups
An AWS account was created along with a root user, normal user and an admin group for a secure structure.
The [AWS documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html) details everything.

> As a best practice, do not use the AWS account root user for any task where it's not required. Instead, create a new IAM user for each person that requires administrator access.

### Generating access keys
To setup a local development environment, access keys need to be generated. The [AWS documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-creds) was followed for this step.

> The only time that you can view or download the secret access key is when you create the keys. You cannot recover them later. However, you can create new access keys at any time.

## Create S3
Will be updated

## Create EC2 instance
ssh keys

Will be updated

## Creating a lambda function from the dashboard
A Lambda function was created from the [AWS Lambda](https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions) dashboard specifying the Python environment. Detailed description can be found [here](https://docs.aws.amazon.com/lambda/latest/dg/getting-started-create-function.html).

We are offered with a flow of the function starting from a trigger point to the main function followed by its output. We are also provided a web editor which supports a function size can upto 3 MB. Beyond that limit, the functions have to be uploaded as a zip along with the dependencies. Zip files of size upto 50 MB can be uploaded directly using the dashboard or AWS CLI. Libraries like OpenCV cross beyond 50 MB mark and we upload the function into S3 which is a storage service by AWS. 

The workflow we target is Develop in local environment -> create the function zip -> upload to AWS S3 -> import the lambda function from S3

#### Errors and troubleshooting
1. Ensure the following trust policy in case you get errors due to limited execution role
```json
{
   "Version": "2012-10-17",
   "Statement": 
   [
      {
         "Effect": "Allow",
         "Principal": 
		 {
            "Service": 
			[
               "lambda.amazonaws.com",
            ]
         },
         "Action": "sts:AssumeRole"
      }
   ]
}
```

2. In case the lambda_function could not be found during the import step, ensure that the handler info is `<file_name>.<main_function>`. For instance, if the entry point is `lambda_handler` defined in `lambda_function.py`, the handler info will be `lambda_function.lambda_handler`

## Setting up local environment
### Download and install
All platforms : https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html
Steps for linux : https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux.html#cliv2-linux-install

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws --version
```

Configure the local environment

```bash
aws configure
```

All steps [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)

## Setting up numpy and opencv

[Site that helped partially](https://www.bigendiandata.com/2019-04-15-OpenCV_AWS_Lambda/)

```python
yum install python3 zip -y
mkdir packages
echo "opencv-python" >> ./requirements.txt
python3.7 -m pip install --upgrade pip
pip install -r ./requirements.txt -t ./packages/
zip -r packages.zip packages/*
zip -g packages.zip lambda_function.py
aws s3 cp packages.zip s3://<sample_bucket>/
aws lambda update-function-code --function-name sample_function --s3-bucket <sample_bucket> --s3-key dep-package21.zip
aws lambda update-function-code --function-name MyLambdaFunction --zip-file fileb://deployment-package.zip
```

Sample function
```python
import json
import os
import boto3
import cv2
import numpy as np
import io


s3 = boto3.resource("s3")


def image_from_s3(bucket, key):
    bucket = s3.Bucket(bucket)
    img = bucket.Object(key).get().get("Body").read()
    nparray = cv2.imdecode(np.asarray(bytearray(img)), cv2.IMREAD_COLOR)
    return np.shape(nparray)


def lambda_handler(event, context):
    image_bucket = "<sample_bucket"
    image_key = "<sample_image>.jpg"
    return image_from_s3(image_bucket, image_key)

```