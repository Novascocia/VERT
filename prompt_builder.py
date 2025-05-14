def build_prompt(traits: dict) -> str:
    """
    Converts trait data into a descriptive image prompt for DALL·E 3.
    """
    base_description = (
        "A 2D digital illustration of a cute, stylized mascot character "
        "in an urban cel-shaded anime style. The character has a large head, small body, and bold outlines. "
    )

    trait_descriptions = []

    for category, info in traits.items():
        name = info.get("Name", "").strip()
        description = info.get("Description", "").strip()
        if name and description:
            trait_descriptions.append(f"{name}: {description}")

    prompt = base_description + "Features include: " + ", ".join(trait_descriptions) + \
             ". Draw the character on a plain white background with no text or logos."

    return prompt


def generate_prompts_for_characters(characters: list) -> dict:
    """
    Takes a list of characters (each with ID and traits) and returns a dict of prompts keyed by character ID.
    """
    prompt_dict = {}

    for character in characters:
        char_id = character.get("id")
        traits = character.get("traits")
        if char_id and traits:
            prompt = build_prompt(traits)
            prompt_dict[char_id] = prompt

    return prompt_dict 