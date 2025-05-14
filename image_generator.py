import openai
import os
from io import BytesIO
from dotenv import load_dotenv
import requests

load_dotenv()

# ✅ Use OpenAI client properly
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_image_from_prompt(_: str) -> BytesIO:
    """
    Instead of generating from text, generate a variation of the base reference character.
    The prompt is ignored (placeholder), and the local image is used directly.
    """
    file_path = "reference character.png"

    with open(file_path, "rb") as image_file:
        response = client.images.create_variation(
            image=image_file,
            n=1,
            size="1024x1024",
            response_format="url"
        )

    image_url = response.data[0].url

    img_response = requests.get(image_url)
    if img_response.status_code != 200:
        raise Exception("Failed to download image variation from OpenAI.")

    return BytesIO(img_response.content) 