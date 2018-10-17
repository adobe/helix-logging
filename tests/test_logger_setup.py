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
