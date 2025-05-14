import os

path = "Keys/serviceAccountKey.json"
print("Exists:", os.path.exists(path))
from trait_loader import load_traits_by_tier, generate_random_character, write_character_to_firebase, generate_character_metadata, update_character_ipfs_url
from ipfs_uploader import IPFSUploader

traits = load_traits_by_tier("verticals_with_charactercolor.json")
character_colors = traits.get("CharacterColor", {})

print("\n✅ Trait loading and color injection complete.\n")
print("CharacterColor trait counts per tier:")
for tier in ["Common", "Rare", "Epic", "Legendary", "Mythical"]:
    count = len(character_colors.get(tier, []))
    print(f"  {tier}: {count} traits")

# Generate a random character
character = generate_random_character(traits)
print("\nGenerated Character:")
for category, trait in character.items():
    print(f"\n{category}:")
    print(f"  Name: {trait['name']}")
    print(f"  Description: {trait['description']}")
    print(f"  Compatibility: {trait['compatibility_notes']}")

# Generate metadata and write to Firebase
metadata = generate_character_metadata(character, character_id=20)
success = write_character_to_firebase(metadata)
print(f"\nFirebase Write Status:")
print(f"Character ID: {metadata['id']}")
print(f"Rarity Score: {metadata['rarity_score']:.2f}")
print(f"Write Successful: {success}")

# If Firebase write was successful, upload to IPFS
if success:
    try:
        uploader = IPFSUploader()
        ipfs_url = uploader.upload_metadata(metadata)
        if ipfs_url:
            print(f"\n✅ IPFS Upload Successful!")
            print(f"URL: {ipfs_url}")
            # Update Firestore document with IPFS URL
            update_success = update_character_ipfs_url(metadata['id'], ipfs_url)
            print(f"Firestore IPFS URL Update Successful: {update_success}")
        else:
            print("\n❌ Failed to upload to IPFS")
    except ValueError as e:
        print(f"\n❌ {str(e)}")
