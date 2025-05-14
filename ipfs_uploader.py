import json
import requests
import os
from dotenv import load_dotenv
from typing import Dict, Any, Optional
import logging
from datetime import datetime
from firebase_admin.firestore import SERVER_TIMESTAMP

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IPFSUploader:
    def __init__(self):
        """
        Initialize the IPFS uploader with Pinata API credentials.
        """
        # Load Pinata credentials from environment
        self.api_key = os.getenv("PINATA_API_KEY")
        self.api_secret = os.getenv("PINATA_API_SECRET")
        
        if not self.api_key or not self.api_secret:
            raise ValueError("Pinata API credentials not found. Please set PINATA_API_KEY and PINATA_API_SECRET in .env file.")
        
        print(f"🔐 Pinata API key loaded: {self.api_key[:5]}... (hidden for security)")

    def upload_metadata(self, metadata: Dict[str, Any]) -> Optional[str]:
        """
        Upload character metadata to IPFS using Pinata API.
        
        Args:
            metadata (Dict[str, Any]): The character metadata dictionary to upload
            
        Returns:
            Optional[str]: The IPFS URL if successful, None if failed
        """
        try:
            # Sanitize metadata before upload
            sanitized_metadata = self._sanitize_metadata(metadata)

            # Verify JSON serialization
            try:
                json.dumps(sanitized_metadata)
            except TypeError as e:
                logger.error(f"Metadata is not JSON serializable: {str(e)}")
                return None

            # Prepare request
            url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
            headers = {
                "Content-Type": "application/json",
                "pinata_api_key": self.api_key,
                "pinata_secret_api_key": self.api_secret
            }
            payload = {
                "pinataContent": sanitized_metadata
            }

            print("\n📤 Making Pinata IPFS upload request...")
            
            # Initialize response as None
            response = None
            try:
                response = requests.post(
                    url,
                    headers=headers,
                    json=payload
                )
                response.raise_for_status()
                
                print(f"📡 Pinata IPFS Upload Response Details:")
                print(f"Status Code: {response.status_code}")

                # Check response
                result = response.json()
                cid = result.get("IpfsHash")
                if cid:
                    ipfs_url = f"https://ipfs.io/ipfs/{cid}"
                    print(f"✅ IPFS Upload Successful! URL: {ipfs_url}")
                    logger.info(f"Successfully uploaded metadata to IPFS: {ipfs_url}")
                    return ipfs_url
                else:
                    logger.error("No IpfsHash in response")
                    return None
                    
            except requests.exceptions.RequestException as e:
                if response is not None:
                    logger.error(f"Failed to upload to IPFS. Status code: {response.status_code}")
                    logger.error(f"Response: {response.text}")
                else:
                    logger.error(f"Failed to make request to IPFS: {str(e)}")
                return None

        except Exception as e:
            logger.error(f"Error uploading to IPFS: {str(e)}")
            return None

    def _sanitize_metadata(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sanitize metadata to ensure it's JSON serializable.
        Converts special types to basic Python types and removes non-standard fields.
        
        Args:
            metadata (Dict[str, Any]): The metadata dictionary to sanitize
            
        Returns:
            Dict[str, Any]: Sanitized metadata dictionary
        """
        sanitized = {}
        
        # Fields to keep in the metadata
        keep_fields = {
            'id', 'traits', 'rarity_summary', 'rarity_score', 
            'generation_seed', 'minted_at'
        }
        
        for key, value in metadata.items():
            if key not in keep_fields:
                continue
                
            if isinstance(value, dict):
                sanitized[key] = self._sanitize_metadata(value)
            elif isinstance(value, list):
                sanitized[key] = [
                    self._sanitize_metadata(item) if isinstance(item, dict) else item
                    for item in value
                ]
            elif isinstance(value, datetime):
                sanitized[key] = value.isoformat()
            elif value is SERVER_TIMESTAMP:
                sanitized[key] = datetime.utcnow().isoformat()
            elif hasattr(value, 'to_dict'):  # Handle Firebase types
                sanitized[key] = value.to_dict()
            elif hasattr(value, '__dict__'):  # Handle custom objects
                sanitized[key] = self._sanitize_metadata(value.__dict__)
            else:
                sanitized[key] = value
                
        return sanitized

def upload_character_to_ipfs(metadata: Dict[str, Any]) -> Optional[str]:
    """
    Helper function to upload character metadata to IPFS.
    
    Args:
        metadata (Dict[str, Any]): The character metadata dictionary
        
    Returns:
        Optional[str]: The IPFS URL if successful, None if failed
    """
    uploader = IPFSUploader()
    return uploader.upload_metadata(metadata)

# Example usage
if __name__ == "__main__":
    # Example metadata
    test_metadata = {
        "id": 1,
        "name": "Test Character",
        "description": "A test character for IPFS upload",
        "attributes": [
            {"trait_type": "HeadType", "value": "Roundhead"},
            {"trait_type": "EyesFace", "value": "Ghosted"}
        ]
    }
    
    # Upload to IPFS
    ipfs_url = upload_character_to_ipfs(test_metadata)
    if ipfs_url:
        print(f"\n✅ Successfully uploaded to IPFS:")
        print(f"URL: {ipfs_url}")
    else:
        print("\n❌ Failed to upload to IPFS") 