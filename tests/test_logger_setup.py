import os
import unittest


class TestLoggerSetup(unittest.TestCase):

    ############################
    #### setUp and tearDown ####
    ############################

    def setUp(self):
        """
        Executed prior to each test.
        """
        pass

    def tearDown(self):
        """
        Executed after each test.
        """
        pass

    ###############
    #### TESTS ####
    ###############

    def test_main_page(self):
        self.assertEqual(200, 200)
