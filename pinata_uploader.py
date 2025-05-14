import requests
import os
from dotenv import load_dotenv

load_dotenv()

PINATA_API_KEY = os.getenv("PINATA_API_KEY")
PINATA_SECRET_API_KEY = os.getenv("PINATA_SECRET_API_KEY")

def upload_image_to_pinata(image_bytes: bytes, filename: str) -> str:
    """
    Uploads an image to Pinata and returns the public IPFS gateway URL.
    """
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"

    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_SECRET_API_KEY,
    }

    files = {
        'file': (filename, image_bytes, 'image/png')
    }

    response = requests.post(url, headers=headers, files=files)

    if response.status_code != 200:
        raise Exception(f"Image upload failed: {response.text}")

    ipfs_hash = response.json()["IpfsHash"]
    return f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}"

def upload_metadata_to_pinata(json_data: str, filename: str) -> str:
    """
    Uploads a metadata JSON string to Pinata and returns the IPFS URL.
    """
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_SECRET_API_KEY,
    }

    files = {
        'file': (filename, json_data, 'application/json')
    }

    response = requests.post(url, headers=headers, files=files)

    if response.status_code != 200:
        raise Exception(f"Metadata upload failed: {response.text}")

    ipfs_hash = response.json()["IpfsHash"]
    return f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}" 