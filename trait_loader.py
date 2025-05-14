import json
from typing import Dict, List, Any, Optional
import random
import firebase_admin
from firebase_admin import credentials, firestore
import logging

# Initialize Firebase (only once)
if not firebase_admin._apps:
    cred = credentials.Certificate("Keys/serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

# Firestore client
db = firestore.client()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_traits_by_tier(json_file_path: str) -> Dict[str, Dict[str, List[Dict[str, str]]]]:
    """
    Load traits from a JSON file and organize them by category and rarity tier.
    
    Args:
        json_file_path (str): Path to the JSON file containing trait data
        
    Returns:
        Dict[str, Dict[str, List[Dict[str, str]]]]: A dictionary where:
            - First level key is the category (e.g., "HeadType", "EyesFace")
            - Second level key is the rarity tier (e.g., "Common", "Rare", "Epic", "Legendary", "Mythical")
            - Value is a list of trait dictionaries, each containing:
                - name: The name of the trait
                - description: Description of the trait
                - compatibility_notes: Notes about trait compatibility
    """
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Inject CharacterColor category with full trait data
        data["CharacterColor"] = {
            "Common": [
                {"name": "Black", "description": "Matte black tone with light diffusion", "compatibility_notes": "Compatible with all head and clothing styles"},
                {"name": "White", "description": "Flat white tone, high contrast", "compatibility_notes": "Avoid with bright accessories"},
                {"name": "Red", "description": "Standard crimson red", "compatibility_notes": "Pairs well with aggressive aura effects"},
                {"name": "Blue", "description": "Urban blue tone", "compatibility_notes": "Neutral with most styles"},
                {"name": "Green", "description": "Muted jungle green", "compatibility_notes": "Blends with earthy or graffiti looks"},
                {"name": "Yellow", "description": "Streetlight yellow", "compatibility_notes": "Use with caution on bright backgrounds"},
                {"name": "Purple", "description": "Saturated deep purple", "compatibility_notes": "Complements dark accessories"},
                {"name": "Orange", "description": "Urban orange, like traffic cones", "compatibility_notes": "Best with black or gray outfits"},
                {"name": "Brown", "description": "Earthy tone for grounded character types", "compatibility_notes": "Neutral color, works with most traits"},
                {"name": "Gray", "description": "Cool neutral gray", "compatibility_notes": "Pairs well with tech or basic styles"}
            ],
            "Rare": [
                {"name": "Electric Blue", "description": "Glowing neon blue tone", "compatibility_notes": "Best with high-tech or Epic gear"},
                {"name": "Crimson", "description": "Deep blood red", "compatibility_notes": "Pairs with aggressive or mythic themes"},
                {"name": "Olive", "description": "Urban olive drab", "compatibility_notes": "Military-style outfits recommended"},
                {"name": "Teal", "description": "Stylized teal with slight glow", "compatibility_notes": "Complements layered clothing"},
                {"name": "Maroon", "description": "Dark urban red tone", "compatibility_notes": "Neutral with bold backgrounds"},
                {"name": "Steel", "description": "Polished steel-like gray", "compatibility_notes": "Pairs with metal or cyber traits"},
                {"name": "Indigo", "description": "Mysterious mid-purple-blue", "compatibility_notes": "Ideal with stealth characters"},
                {"name": "Lime", "description": "Highlighter green", "compatibility_notes": "Avoid with yellow-heavy themes"},
                {"name": "Amber", "description": "Rich gold-orange hue", "compatibility_notes": "Blends well with graffiti effects"},
                {"name": "Slate", "description": "Cool gray-blue mix", "compatibility_notes": "Neutral for layered outfits"}
            ],
            "Epic": [
                {"name": "Lava Red", "description": "Molten glowing red", "compatibility_notes": "Use with fiery or magic sets"},
                {"name": "Frost Blue", "description": "Icy pale blue shimmer", "compatibility_notes": "Best with cold-themed accessories"},
                {"name": "Toxic Green", "description": "Acid-glow green", "compatibility_notes": "Pairs with glitch or corrupted traits"},
                {"name": "Obsidian", "description": "Gloss black with deep reflectivity", "compatibility_notes": "Use with bold outlines"},
                {"name": "Violet Flame", "description": "Pulsing purple glow", "compatibility_notes": "Pairs with rare aura types"},
                {"name": "Cyan Glow", "description": "Bright cyan edge lighting", "compatibility_notes": "Avoid on overly bright backgrounds"},
                {"name": "Chrome", "description": "Reflective steel finish", "compatibility_notes": "Best with minimal clothing"},
                {"name": "Plasma White", "description": "Overexposed white light skin tone", "compatibility_notes": "Use with subtle outfits"},
                {"name": "Rust Orange", "description": "Gritty weathered metal tone", "compatibility_notes": "Pairs with utility gear"},
                {"name": "Solar Yellow", "description": "Warm glowing golden yellow", "compatibility_notes": "Avoid clashing bright colors"}
            ],
            "Legendary": [
                {"name": "Gold", "description": "Polished mythic gold finish", "compatibility_notes": "Reserved for elite characters"},
                {"name": "Silver", "description": "Shimmering silver-tone skin", "compatibility_notes": "Pairs well with celestial backdrops"},
                {"name": "Spectrum", "description": "Animated flowing gradient", "compatibility_notes": "Use with simple clothing only"},
                {"name": "Cracked Crystal", "description": "Semi-transparent cracked gem look", "compatibility_notes": "Glows best on dark backgrounds"},
                {"name": "Radiant Ember", "description": "Inner ember glow under dark skin", "compatibility_notes": "Pairs well with glowing eyes"},
                {"name": "Ancient Bronze", "description": "Weathered historic metal", "compatibility_notes": "Use with armor or regalia"},
                {"name": "Shadowcore", "description": "Dark skin with shifting smoke texture", "compatibility_notes": "Best with bold auras"},
                {"name": "Digital Fade", "description": "Pixelated fade effect over solid tone", "compatibility_notes": "High-tech characters only"},
                {"name": "Opal", "description": "Reflective stone with multiple undertones", "compatibility_notes": "Best with simple accessories"},
                {"name": "Hyper Red", "description": "Over-saturated electric red", "compatibility_notes": "Pair with glitch gear"}
            ],
            "Mythical": [
                {"name": "Rainbow Pulse", "description": "Animated shifting rainbow skin", "compatibility_notes": "Must be matched with minimal gear"},
                {"name": "Galaxy Core", "description": "Visible stars and galactic glow under skin", "compatibility_notes": "Only fits Mythical-class builds"},
                {"name": "Pure Light", "description": "Radiates white light from skin", "compatibility_notes": "Avoid bright backgrounds"},
                {"name": "Quantum Glitch", "description": "Distorted noise patterns across body", "compatibility_notes": "Exclusive to glitch-theme legends"},
                {"name": "Void Shroud", "description": "Skin appears like a hole in reality", "compatibility_notes": "Must be used with contrasting auras"},
                {"name": "Aurora Veil", "description": "Soft blend of aurora borealis colors", "compatibility_notes": "Pairs with celestial themes"},
                {"name": "Glass Prism", "description": "Transparent reflective color-shifting skin", "compatibility_notes": "Do not layer with metallic traits"},
                {"name": "Nexus Flame", "description": "Cracked molten core energy leaks from skin", "compatibility_notes": "Mythical backgrounds only"},
                {"name": "Phantom Black", "description": "Blacker than black, no light reflects", "compatibility_notes": "Glowing accessories required"},
                {"name": "Echo Shader", "description": "Faint silhouettes trail behind movements", "compatibility_notes": "Mythical only"}
            ]
        }
        
        # Write the full data dictionary to a new file
        try:
            with open("verticals_with_charactercolor.json", 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            logger.info("Successfully wrote data to verticals_with_charactercolor.json")
        except Exception as e:
            logger.error(f"Error writing to verticals_with_charactercolor.json: {str(e)}")
            
        return data
    except FileNotFoundError:
        raise FileNotFoundError(f"Could not find the trait file at: {json_file_path}")
    except json.JSONDecodeError:
        raise ValueError(f"Invalid JSON format in file: {json_file_path}")
    except Exception as e:
        raise Exception(f"Error loading traits: {str(e)}")

def get_all_traits_flat_list(traits_data: Dict[str, Dict[str, List[Dict[str, str]]]]) -> List[Dict[str, Any]]:
    """
    Flatten the trait structure into a single list of traits with category and rarity information.
    """
    flat_traits = []
    for category, tiers in traits_data.items():
        for tier, traits in tiers.items():
            for trait in traits:
                flat_trait = {
                    'category': category,
                    'rarity_tier': tier,
                    **trait
                }
                flat_traits.append(flat_trait)
    return flat_traits

def generate_random_character(traits_data: Dict[str, Dict[str, List[Dict[str, str]]]], seed: Optional[int] = None) -> Dict[str, Dict[str, Any]]:
    """
    Generate a random character by selecting one trait from each category using weighted rarity tiers.
    """
    if seed is not None:
        random.seed(seed)
    rarity_weights = {'Common': 70, 'Rare': 20, 'Epic': 6, 'Legendary': 3, 'Mythical': 1}
    rarity_tiers = list(rarity_weights.keys())
    weights = list(rarity_weights.values())
    character = {}
    for category, tiers in traits_data.items():
        selected_tier = random.choices(rarity_tiers, weights=weights, k=1)[0]
        tier_traits = tiers.get(selected_tier, [])
        if not tier_traits:
            for tier in rarity_tiers:
                if tiers.get(tier):
                    tier_traits = tiers[tier]
                    selected_tier = tier
                    break
        if not tier_traits:
            continue
        selected_trait = random.choice(tier_traits)
        character[category] = selected_trait
    return character

def generate_character_metadata(character: Dict[str, Dict[str, Any]], character_id: int, generation_seed: Optional[int] = None) -> Dict[str, Any]:
    """
    Generate metadata for a character including rarity summary and score.
    """
    rarity_scores = {'Common': 0.0, 'Rare': 0.25, 'Epic': 0.5, 'Legendary': 0.75, 'Mythical': 1.0}
    rarity_summary = {tier: 0 for tier in rarity_scores}
    total_traits = 0
    rarity_score_sum = 0.0
    for category, trait in character.items():
        rarity_tier = trait.get('rarity_tier', 'Common')
        rarity_summary[rarity_tier] += 1
        total_traits += 1
        rarity_score_sum += rarity_scores[rarity_tier]
    rarity_score = rarity_score_sum / total_traits if total_traits > 0 else 0.0
    metadata = {'id': character_id, 'traits': character, 'rarity_summary': rarity_summary, 'rarity_score': rarity_score}
    if generation_seed is not None:
        metadata['generation_seed'] = generation_seed
    return metadata

def is_character_duplicate(new_character: Dict[str, Dict[str, Any]], existing_characters: List[Dict[str, Any]]) -> bool:
    """
    Check if a newly generated character is a duplicate of any existing character.
    """
    new_combo = {cat: tr['name'] for cat, tr in new_character.items()}
    for existing in existing_characters:
        existing_combo = {cat: tr['name'] for cat, tr in existing['traits'].items()}
        if new_combo == existing_combo:
            return True
    return False

def write_character_to_firebase(metadata: Dict[str, Any]) -> bool:
    """
    Write character metadata to Firebase Firestore.
    """
    try:
        try:
            firebase_admin.get_app()
        except ValueError:
            firebase_admin.initialize_app()
            logger.info("Firebase Admin SDK initialized")
        db = firestore.client()
        character_id = str(metadata['id'])
        doc_ref = db.collection('minted_characters').document(character_id)
        doc = doc_ref.get()
        if doc.exists:
            logger.warning(f"Character {character_id} already exists in Firestore. Skipping write.")
            return False
        metadata['minted_at'] = firestore.SERVER_TIMESTAMP
        doc_ref.set(metadata)
        logger.info(f"Successfully wrote character {character_id} to Firestore")
        return True
    except firebase_admin.exceptions.FirebaseError as e:
        logger.error(f"Firebase error while writing character {metadata.get('id')}: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error while writing character {metadata.get('id')}: {str(e)}")
        return False

def update_character_ipfs_url(character_id: int, ipfs_url: str) -> bool:
    """
    Update the Firestore document for the given character_id with the IPFS URL.
    Args:
        character_id (int): The ID of the character document to update.
        ipfs_url (str): The IPFS URL or CID to store.
    Returns:
        bool: True if update was successful, False otherwise.
    """
    try:
        db = firestore.client()
        doc_ref = db.collection("minted_characters").document(str(character_id))
        doc_ref.update({"ipfs_url": ipfs_url})
        logging.info(f"Successfully updated character {character_id} with IPFS URL: {ipfs_url}")
        return True
    except Exception as e:
        logging.error(f"Failed to update character {character_id} with IPFS URL: {str(e)}")
        return False

# Example usage
if __name__ == "__main__":
    try:
        traits = load_traits_by_tier("verticals_with_charactercolor.json")
        print("Hierarchical Structure:")
        for category in traits:
            print(f"\nCategory: {category}")
            for tier in traits[category]:
                if traits[category][tier]:
                    print(f"  Tier: {tier}")
                    print(f"  Number of traits: {len(traits[category][tier])}")
                    print(f"  Example trait: {traits[category][tier][0]['name']}")
        print("\nFlat Structure:")
        flat_traits = get_all_traits_flat_list(traits)
        print(f"Total number of traits: {len(flat_traits)}")
        print("\nExample traits from flat list:")
        for i, trait in enumerate(flat_traits[:3]):
            print(f"\nTrait {i + 1}:")
            print(f"  Category: {trait['category']}")
            print(f"  Rarity: {trait['rarity_tier']}")
            print(f"  Name: {trait['name']}")
            print(f"  Description: {trait['description']}")
            print(f"  Compatibility: {trait['compatibility_notes']}")
        print("\nRandom Character Generation:")
        character = generate_random_character(traits)
        print("Generated Character:")
        for category, trait in character.items():
            print(f"\n{category}:")
            print(f"  Name: {trait['name']}")
            print(f"  Description: {trait['description']}")
            print(f"  Compatibility: {trait['compatibility_notes']}")
        print("\nDeterministic Character Generation (with seed):")
        character = generate_random_character(traits, seed=42)
        print("Generated Character (seed=42):")
        for category, trait in character.items():
            print(f"\n{category}:")
            print(f"  Name: {trait['name']}")
            print(f"  Description: {trait['description']}")
            print(f"  Compatibility: {trait['compatibility_notes']}")
        print("\nCharacter Metadata:")
        metadata = generate_character_metadata(character, character_id=1, generation_seed=42)
        print(f"Character ID: {metadata['id']}")
        print("Rarity Summary:")
        for tier, count in metadata['rarity_summary'].items():
            print(f"  {tier}: {count}")
        print(f"Rarity Score: {metadata['rarity_score']:.2f}")
        print(f"Generation Seed: {metadata.get('generation_seed', 'Not provided')}")
        print("\nDuplicate Checking:")
        existing_chars = [
            generate_character_metadata(generate_random_character(traits), 1),
            generate_character_metadata(generate_random_character(traits), 2)
        ]
        new_char = generate_random_character(traits)
        is_duplicate = is_character_duplicate(new_char, existing_chars)
        print(f"Is new character a duplicate: {is_duplicate}")
        duplicate_char = existing_chars[0]['traits']
        is_duplicate = is_character_duplicate(duplicate_char, existing_chars)
        print(f"Is known duplicate a duplicate: {is_duplicate}")
        print("\nFirebase Write Test:")
        success = write_character_to_firebase(metadata)
        print(f"Write successful: {success}")
    except Exception as e:
        print(f"Error: {str(e)}")


def mint_and_store_character(character_id: int, seed: Optional[int] = None) -> Optional[Dict[str, Any]]:
    try:
        traits = load_traits_by_tier("verticals_with_charactercolor.json")
        character = generate_random_character(traits, seed=seed)
        metadata = generate_character_metadata(character, character_id, generation_seed=seed)
        success = write_character_to_firebase(metadata)
        if success:
            print(f"Character {character_id} successfully minted and stored.")
            return metadata
        else:
            print(f"Character {character_id} already exists or write failed.")
            return None
    except Exception as e:
        print(f"Error during mint: {e}")
        return None

if __name__ == "__main__":
    mint_and_store_character(character_id=1, seed=42)
