from django.test import SimpleTestCase


class HealthCheckTests(SimpleTestCase):
    def test_health_check(self):
        response = self.client.get("/api/v1/health/")
        self.assertEqual(response.status_code, 200)
