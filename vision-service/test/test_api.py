import io
import os
import unittest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient
from PIL import Image

from app.main import MealAnalysis, MealItem, app


class VisionApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.previous = os.environ.get("VISION_SERVICE_TOKEN")
        os.environ["VISION_SERVICE_TOKEN"] = "private-test-token"
        self.client = TestClient(app)
        image = Image.new("RGB", (32, 24), "white")
        output = io.BytesIO()
        image.save(output, "PNG")
        self.png = output.getvalue()

    def tearDown(self) -> None:
        if self.previous is None:
            os.environ.pop("VISION_SERVICE_TOKEN", None)
        else:
            os.environ["VISION_SERVICE_TOKEN"] = self.previous

    def test_health_and_private_boundary(self) -> None:
        self.assertEqual(self.client.get("/health").status_code, 200)
        response = self.client.post("/v1/meals/analyze", files={"image": ("meal.png", self.png, "image/png")})
        self.assertEqual(response.status_code, 401)

    @patch("app.main.ask_gemini", new_callable=AsyncMock)
    def test_valid_image_returns_strict_meal_schema(self, ask: AsyncMock) -> None:
        ask.return_value = MealAnalysis(items=[MealItem(name="Rice", quantity_g=150, calories=195, protein=4, carbs=42, fat=0.5)], assumptions=["Cooked weight estimated."])
        response = self.client.post(
            "/v1/meals/analyze",
            headers={"x-service-token": "private-test-token"},
            files={"image": ("meal.png", self.png, "image/png")},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["items"][0]["name"], "Rice")
        self.assertEqual(ask.await_count, 1)

    def test_rejects_invalid_content(self) -> None:
        response = self.client.post(
            "/v1/meals/analyze",
            headers={"x-service-token": "private-test-token"},
            files={"image": ("meal.png", b"not an image", "image/png")},
        )
        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()
