import json
from pinata_uploader import upload_metadata_to_pinata

def patch_and_upload_metadata(characters: list, image_urls: dict) -> dict:
    """
    Adds image URLs to character metadata, uploads to Pinata,
    and returns dict of { character_id: metadata_ipfs_url }
    """
    metadata_urls = {}

    for character in characters:
        char_id = character["id"]
        traits = character["traits"]
        image_url = image_urls.get(char_id)

        if not image_url:
            print(f"⚠️ No image URL found for Character {char_id}, skipping.")
            continue

        metadata = {
            "name": f"Vertical #{char_id}",
            "description": "A unique character from the Vertical Project NFT collection.",
            "image": image_url,
            "traits": traits
        }

        json_data = json.dumps(metadata)
        filename = f"character_{char_id}_metadata.json"

        # Upload final metadata to Pinata
        metadata_ipfs_url = upload_metadata_to_pinata(json_data, filename)

        print(f"📦 Uploaded metadata for Character {char_id}: {metadata_ipfs_url}")
        metadata_urls[char_id] = metadata_ipfs_url

    return metadata_urls 