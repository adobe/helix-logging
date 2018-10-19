import unittest

from moto import mock_s3, mock_iam, mock_lambda

from logger_setup import LoggerSetup


class TestLoggerSetup(unittest.TestCase):

    @mock_s3
    @mock_iam
    @mock_lambda
    def setUp(self):
        """
        Executed prior to each test.
        """
        self.logger_setup = LoggerSetup('FASTLY_KEY', 'AWS_KEY', 'AWS_SECRET')

    def tearDown(self):
        """:returns
        Executed after each test.
        """
        pass

    # ---------------------------- TEST S3 ----------------------------

    @mock_s3
    def test_create_s3_bucket(self):
        response = self.logger_setup._create_s3_bucket('helix-test--ruxandra')
        response_status = response.get('ResponseMetadata', {}).get('HTTPStatusCode')
        self.assertEqual(
            response_status,
            200,
            msg='Expected status code 200 for creating bucket'
        )

    @mock_s3
    def test_remove_s3_bucket_when_does_not_exist(self):
        response = self.logger_setup._remove_s3_bucket('helix-test--ruxandra')
        self.assertIsNone(
            response,
            msg='Removing bucket should return None'
        )

    @mock_s3
    def test_remove_s3_bucket(self):
        self.logger_setup._create_s3_bucket('helix-test--ruxandra')
        response = self.logger_setup._remove_s3_bucket('helix-test--ruxandra')
        self.assertIsNone(
            response,
            msg='Removing bucket should return None'
        )

    # --------------------- TEST ADDING ACCESS POLICIES  ---------------------

    @mock_iam
    def test_create_iam_policy_for_accessing_bucket(self):
        """
        Assert IAM policy creation, allowing access to the S3 bucket.
        """
        bucket = 'helix-test--ruxandra'
        policy_arn = self.logger_setup._create_iam_policy_for_accessing_bucket(bucket)

        # Policy should end with bucket name, and should contain the known start string.
        self.assertTrue(policy_arn.endswith(bucket))
        self.assertTrue(policy_arn.startswith('arn:aws:iam::'))

    @mock_iam
    def test_create_iam_user(self):
        """
        Create IAM user:
            * create IAM policy
            * create IAM user with that policy
        """
        bucket = 'helix-test--ruxandra'
        policy_arn = self.logger_setup._create_iam_policy_for_accessing_bucket(bucket)
        response = self.logger_setup._create_iam_user(bucket, policy_arn)
        self.assertTrue(response)

    @mock_iam
    def test_create_iam_user_duplicated_call(self):
        bucket = 'helix-test--ruxandra'
        policy_arn = self.logger_setup._create_iam_policy_for_accessing_bucket(bucket)
        response1 = self.logger_setup._create_iam_user(bucket, policy_arn)
        self.assertTrue(response1)

        response2 = self.logger_setup._create_iam_user(bucket, policy_arn)
        self.assertTrue(response2)
