import json
import os
import random

# Load trait data
with open("verticals_with_charactercolor.json", "r") as f:
    traits_data = json.load(f)

# Load available GraphicText options
graphic_texts = traits_data.get("GraphicText", [])
graphic_text_options = [gt["name"] for gt in graphic_texts]

# Randomly select one
selected_graphic_text = random.choice(graphic_text_options)

# Define allowed species per rarity
tier_species_map = {
    "Common": ["Mascot"],
    "Rare": ["Mascot", "Cat", "Skull"],
    "Epic": ["Mascot", "Cat", "Skull", "Flamehead", "Hollow"],
    "Legendary": ["Mascot", "Cat", "Skull", "Flamehead", "Hollow", "Gold Hybrid", "Alien"],
    "Mythical": ["Mascot", "Cat", "Skull", "Flamehead", "Hollow", "Gold Hybrid", "Alien", "Glitch Variant"]
}

# Prompt builder template
def build_prompt(character_traits, species):
    head = character_traits["HeadType"]["name"]
    eyes = character_traits["EyesFace"]["name"]
    hoodie = character_traits["ClothingTop"]["name"]
    color = character_traits.get("CharacterColor", {}).get("name", None)

    base = f"Create a MFKZ-style NFT character with a {species} appearance. "
    base += f"It has {eyes} and wears a {hoodie}. "

    if color and species not in ["Gold Hybrid"]:
        base += f"The character's theme includes the color {color}. "

    base += "Show it in a graffiti alley background with cel-shaded bold cartoon style."
    return base

# Create output folder
os.makedirs("comfy_prompts", exist_ok=True)

# Pick one Common-tier character
common_traits = traits_data["HeadType"]["Common"]

# Build one full test character manually
character = {
    "HeadType": random.choice(traits_data["HeadType"]["Common"]),
    "EyesFace": random.choice(traits_data["EyesFace"]["Common"]),
    "ClothingTop": random.choice(traits_data["ClothingTop"]["Common"]),
    "CharacterColor": random.choice(traits_data["CharacterColor"]["Common"]),
    "GraphicText": selected_graphic_text
}

species = random.choice(tier_species_map["Common"])
prompt = build_prompt(character, species)

# Add GraphicText to the prompt
prompt += f", wearing something that says '{selected_graphic_text}'"

# Save GraphicText to character dictionary for metadata later
character["GraphicText"] = selected_graphic_text

# Also make sure Species is added to character dict (if not already)
character["Species"] = species

# Save to file
with open("comfy_prompts/character_001.txt", "w") as f:
    f.write(prompt)

print("✅ Prompt saved to comfy_prompts/character_001.txt") 