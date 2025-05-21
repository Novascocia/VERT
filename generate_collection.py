import json
import os
from PIL import Image
import random
from pathlib import Path

def load_traits():
    """Load trait data from JSON file."""
    with open("verticals_with_charactercolor.json", "r") as f:
        return json.load(f)

def get_random_trait(traits_data, category, rarity="Common"):
    """Get a random trait from the specified category and rarity."""
    if category in ["GraphicText", "Species"]:
        # These categories don't have rarities
        return random.choice(traits_data[category])
    else:
        return random.choice(traits_data[category][rarity])

def composite_traits(traits, output_path, metadata_path=None):
    """Composite trait images and save the result."""
    # Start with the base mascot image
    base_path = "traits/base_mascot.png"
    if not os.path.exists(base_path):
        raise FileNotFoundError(f"Base mascot image not found at {base_path}")
    
    composite = Image.open(base_path).convert("RGBA")
    
    # Composite each trait layer
    for category, trait in traits.items():
        if category in ["GraphicText", "Species"]:
            # Skip these as they're handled differently
            continue
            
        trait_path = f"traits/{category}/{trait['name'].lower().replace(' ', '_')}.png"
        if not os.path.exists(trait_path):
            print(f"Warning: Trait image not found: {trait_path}")
            continue
            
        layer = Image.open(trait_path).convert("RGBA")
        composite = Image.alpha_composite(composite, layer)
    
    # Save the final image
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    composite.save(output_path)
    
    # Save metadata if requested
    if metadata_path:
        os.makedirs(os.path.dirname(metadata_path), exist_ok=True)
        with open(metadata_path, "w") as f:
            json.dump(traits, f, indent=2)

def generate_collection(num_avatars=100):
    """Generate a collection of avatars."""
    traits_data = load_traits()
    
    for i in range(num_avatars):
        # Generate random traits
        traits = {
            "HeadType": get_random_trait(traits_data, "HeadType"),
            "EyesFace": get_random_trait(traits_data, "EyesFace"),
            "ClothingTop": get_random_trait(traits_data, "ClothingTop"),
            "CharacterColor": get_random_trait(traits_data, "CharacterColor"),
            "GraphicText": get_random_trait(traits_data, "GraphicText"),
            "Species": get_random_trait(traits_data, "Species")
        }
        
        # Generate output paths
        avatar_id = f"{i+1:04d}"
        output_path = f"output/avatar_{avatar_id}.png"
        metadata_path = f"metadata/{avatar_id}.json"
        
        # Composite and save
        try:
            composite_traits(traits, output_path, metadata_path)
            print(f"Generated avatar {avatar_id}")
        except Exception as e:
            print(f"Error generating avatar {avatar_id}: {str(e)}")

if __name__ == "__main__":
    # Create output directories
    os.makedirs("output", exist_ok=True)
    os.makedirs("metadata", exist_ok=True)
    
    # Generate collection
    generate_collection() 