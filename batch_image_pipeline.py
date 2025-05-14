from prompt_builder import generate_prompts_for_characters
from image_generator import generate_image_from_prompt
from pinata_uploader import upload_image_to_pinata

def generate_and_upload_images(characters: list) -> dict:
    """
    Generates and uploads images for a batch of characters.
    Returns a dict of { character_id: ipfs_image_url }
    """
    prompts = generate_prompts_for_characters(characters)
    image_urls = {}

    for char_id, prompt in prompts.items():
        print(f"\n🔨 Generating image for Character {char_id}...")
        print(f"📝 Prompt:\n{prompt}\n")  # Show the exact prompt

        # Generate image from prompt
        image_data = generate_image_from_prompt(prompt)

        # Upload image to Pinata
        filename = f"character_{char_id}.png"
        ipfs_url = upload_image_to_pinata(image_data, filename)

        print(f"✅ Uploaded Character {char_id} to IPFS: {ipfs_url}")
        image_urls[char_id] = ipfs_url

    return image_urls 