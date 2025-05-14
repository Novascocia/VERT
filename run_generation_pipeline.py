from batch_image_pipeline import generate_and_upload_images
from metadata_patcher import patch_and_upload_metadata

# Example test character list
characters = [
    {
        "id": 21,
        "traits": {
            "HeadType": {"Name": "Cone Cap", "Description": "Cone-shaped head like an upside-down traffic cone"},
            "EyesFace": {"Name": "Vertical Prime Glyphs", "Description": "Eyes display pulsing golden runes from the Vertical Core."},
            "ClothingTop": {"Name": "Basketball Jersey", "Description": "Loose jersey with no number, sleeveless"}
        }
    }
]

# Step 1: Generate image and upload to IPFS
image_urls = generate_and_upload_images(characters)

# Step 2: Patch image URLs into metadata and upload metadata to IPFS
metadata_urls = patch_and_upload_metadata(characters, image_urls)

# Step 3: Print final result
print("\n🎉 FINAL METADATA LINKS:")
for cid, url in metadata_urls.items():
    print(f"Character {cid}: {url}") 