import unittest

from moto import mock_s3, mock_iam, mock_lambda
import mock
from unittest.mock import patch

import logger_setup



class TestLoggerSetup(unittest.TestCase):

    AWS_NAMESPACE = 'helix-test--gm98lh4m9g5l4lvdfwdlqs'

    @mock_s3
    @mock_iam
    @mock_lambda
    def setUp(self):
        """
        Executed prior to each test.
        """
        self.logger_setup = logger_setup.LoggerSetup('FASTLY_KEY', 'AWS_KEY', 'AWS_SECRET')

    def tearDown(self):
        """:returns
        Executed after each test.
        """
        pass

    # ---------------------------- TEST S3 ----------------------------

    @mock_s3
    def test_create_s3_bucket(self):
        response = self.logger_setup._create_s3_bucket(self.AWS_NAMESPACE)
        response_status = response.get('ResponseMetadata', {}).get('HTTPStatusCode')
        self.assertEqual(
            response_status,
            200,
            msg='Expected status code 200 for creating bucket'
        )

    # @mock_s3
    # @mock_lambda
    # def test_create_bucket(self):
    #     response = self.logger_setup._create_bucket(self.AWS_NAMESPACE)
    #     from ipdb import set_trace; set_trace()
    #     self.assertEqual(
    #         response,
    #         200,
    #         msg='Expected status code 200 for creating bucket'
    #     )

    @mock_s3
    def test_remove_s3_bucket_when_does_not_exist(self):
        response = self.logger_setup._remove_s3_bucket(self.AWS_NAMESPACE)
        self.assertIsNone(
            response,
            msg='Removing bucket should return None'
        )

    @mock_s3
    def test_remove_s3_bucket(self):
        aws_namespace = self.AWS_NAMESPACE
        self.logger_setup._create_s3_bucket(aws_namespace)
        response = self.logger_setup._remove_s3_bucket(aws_namespace)
        self.assertIsNone(
            response,
            msg='Removing bucket should return None'
        )

    # --------------------- TEST IAM USER CREATION ---------------------

    @mock_iam
    def test_create_iam_policy_for_accessing_bucket(self):
        """
        Assert IAM policy creation, allowing access to the S3 bucket.
        """
        aws_namespace = self.AWS_NAMESPACE
        policy_arn = self.logger_setup._create_iam_policy_for_accessing_bucket(aws_namespace)

        # Policy should end with bucket name, and should contain the known start string.
        self.assertTrue(policy_arn.endswith(aws_namespace))
        self.assertTrue(policy_arn.startswith('arn:aws:iam::'))

    @mock_iam
    def test_create_iam_user(self):
        """
        Create IAM user:
            * create IAM policy
            * create IAM user with that policy
        """
        aws_namespace = self.AWS_NAMESPACE
        policy_arn = self.logger_setup._create_iam_policy_for_accessing_bucket(aws_namespace)
        response = self.logger_setup._create_iam_user(aws_namespace, policy_arn)
        self.assertTrue(response)

        # Make a request to get the user.
        user_data = self.logger_setup.iam_client.get_user(UserName=aws_namespace)
        user_name = user_data.get('User', {}).get('UserName')
        self.assertEqual(user_name, aws_namespace)

    @mock_iam
    def test_create_iam_user_duplicated_call(self):
        aws_namespace = self.AWS_NAMESPACE
        policy_arn = self.logger_setup._create_iam_policy_for_accessing_bucket(aws_namespace)
        response1 = self.logger_setup._create_iam_user(aws_namespace, policy_arn)
        self.assertTrue(response1)

        response2 = self.logger_setup._create_iam_user(aws_namespace, policy_arn)
        self.assertTrue(response2)

        # Make a request to get the user.
        user_data = self.logger_setup.iam_client.get_user(UserName=aws_namespace)
        user_name = user_data.get('User', {}).get('UserName')
        self.assertEqual(user_name, aws_namespace)

    # @mock_s3
    # @mock_iam
    # def test_create_iam_user_with_policies(self):
    #     aws_namespace = self.AWS_NAMESPACE
    #     policy_arn = self.logger_setup._create_iam_policy_for_accessing_bucket(aws_namespace)
    #     self.logger_setup._create_iam_user_with_policies(aws_namespace, policy_arn)
    #
    #     # Check that user was created and policies are in place.
    #     # The calls below should work, but are not yet implemented in moto.
    #     # https://github.com/spulec/moto/issues/1876
    #     self.logger_setup.iam_client.get_user_policy(UserName=aws_namespace, PolicyName=policy_arn)
    #     self.logger_setup.iam_client.get_policy(PolicyArn=policy_arn)

    # @mock_s3s
