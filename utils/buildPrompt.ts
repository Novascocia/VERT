import { traits } from '../data/traits';
import { Trait, SelectedTraits, PromptResult, ImageValidationData } from '../types/traits';

// Helper: flatten all rarity buckets into a single array
function flattenTraitList(categoryObj: any): Trait[] {
  if (Array.isArray(categoryObj)) return categoryObj as Trait[];
  return Object.values(categoryObj).flat() as Trait[];
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Get random traits
export function getRandomTraits(): SelectedTraits {
  console.log(`🎨 Using legacy trait system (no active period)`);
  return getLegacyRandomTraits();
}



// Original trait selection
function getLegacyRandomTraits(): SelectedTraits {
  const selectedTraits: Partial<SelectedTraits> = {};

  // For each category, flatten all rarities and pick randomly
  selectedTraits.HeadType = randomChoice(flattenTraitList(traits.HeadType));
  selectedTraits.EyesFace = randomChoice(flattenTraitList(traits.EyesFace));
  selectedTraits.ClothingTop = randomChoice(flattenTraitList(traits.ClothingTop));
  selectedTraits.CharacterColor = randomChoice(flattenTraitList(traits.CharacterColor));
  selectedTraits.Background = randomChoice(flattenTraitList(traits.Background));

  // GraphicText (optional)
  if (traits.GraphicText && traits.GraphicText.length > 0) {
    selectedTraits.GraphicText = randomChoice(traits.GraphicText);
  } else {
    selectedTraits.GraphicText = { name: "VERT", description: "VERT text in bold, simple font as a patch or tag" };
  }

  // Species: flatten if object, or use as array
  let speciesList: Trait[] = [];
  if (Array.isArray(traits.Species)) {
    speciesList = traits.Species as Trait[];
  } else {
    speciesList = flattenTraitList(traits.Species);
  }
  selectedTraits.Species = randomChoice(speciesList);

  // Assign rarity (weighted random)
  const rarityTiers = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythical'];
  const rarityWeights = [70, 18.75, 9, 1.875, 0.375];
  const sum = rarityWeights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * sum;
  let chosenRarity = rarityTiers[0];
  for (let i = 0; i < rarityTiers.length; i++) {
    if (rand < rarityWeights[i]) {
      chosenRarity = rarityTiers[i];
      break;
    }
    rand -= rarityWeights[i];
  }
  selectedTraits.rarity = chosenRarity;

  // Validate required traits
  if (!selectedTraits.HeadType || !selectedTraits.EyesFace || !selectedTraits.ClothingTop ||
      !selectedTraits.CharacterColor || !selectedTraits.Species || !selectedTraits.Background) {
    throw new Error("Incomplete trait set generated");
  }

  console.log("🎲 Final Selected Traits (Legacy):", selectedTraits);
  return selectedTraits as SelectedTraits;
}

export function buildPrompt(traits: SelectedTraits): PromptResult {
  // Validate required traits
  if (!traits.HeadType || !traits.EyesFace || !traits.ClothingTop ||
      !traits.CharacterColor || !traits.Species || !traits.Background) {
    throw new Error("Incomplete trait set provided to buildPrompt");
  }

  return buildLegacyPrompt(traits);
}



// ANIME-STYLE prompt building: Based on SD 3.5 and astronaut example
function buildLegacyPrompt(traits: SelectedTraits): PromptResult {
  
  // 1. ANIME CHARACTER TYPES - Professional, detailed character roles
  const characterTypes = [
    // Sci-Fi Characters (like the astronaut example)
    "astronaut", "space explorer", "pilot", "engineer", "scientist", "researcher", "technician", "navigator",
    "cosmic traveler", "starship captain", "space medic", "orbital worker", "station commander",
    
    // Fantasy/Mystical
    "mage", "wizard", "sorceress", "enchanter", "alchemist", "scholar", "sage", "mystic",
    "crystal keeper", "elemental guardian", "spirit walker", "dream weaver", "star reader",
    
    // Adventure/Explorer
    "explorer", "adventurer", "treasure hunter", "archaeologist", "botanist", "cartographer",
    "wilderness guide", "mountain climber", "deep sea diver", "cave explorer", "sky sailor",
    
    // Artistic/Creative
    "artist", "musician", "dancer", "performer", "storyteller", "poet", "craftsperson",
    "designer", "architect", "sculptor", "painter", "composer", "inventor",
    
    // Futuristic/Cyberpunk
    "cyber warrior", "data analyst", "network guardian", "digital architect", "code breaker",
    "quantum engineer", "AI specialist", "hologram designer", "virtual reality creator"
  ];
  
  const characterType = randomChoice(characterTypes);

  // 2. ANIME VISUAL STYLES - High quality descriptors for SD 3.5
  const visualStyles = [
    "captivating anime-style illustration",
    "beautiful anime art style", 
    "detailed anime character design",
    "high-quality anime illustration",
    "stunning anime portrait",
    "professional anime artwork",
    "vibrant anime-style art"
  ];
  const chosenStyle = randomChoice(visualStyles);

  // 3. HAIR STYLES - More anime-appropriate descriptions
  const hairStyles = [
    "long flowing hair", "short wavy hair", "curly hair", "straight hair", "braided hair",
    "twin tails", "ponytail", "messy hair", "spiky hair", "layered hair", "bangs",
    "shoulder-length hair", "wavy locks", "silky hair", "windswept hair"
  ];
  const hairStyle = randomChoice(hairStyles);

  // 4. HAIR COLORS - Vibrant anime colors
  const hairColors = [
    "dark", "black", "brown", "blonde", "silver", "white", "blue", "purple", 
    "pink", "red", "green", "orange", "platinum", "golden", "violet", "teal"
  ];
  const hairColor = randomChoice(hairColors);

  // 5. OUTFIT STYLES - Based on character type and traits
  const getOutfitDescription = () => {
    if (characterType.includes("astronaut") || characterType.includes("space") || characterType.includes("pilot")) {
      return "white spacesuit with detailed equipment and patches";
    } else if (characterType.includes("mage") || characterType.includes("wizard") || characterType.includes("mystic")) {
      return "flowing robes with magical accessories";
    } else if (characterType.includes("cyber") || characterType.includes("digital") || characterType.includes("quantum")) {
      return "futuristic tech outfit with glowing elements";
    } else {
      const outfits = [
        "elegant uniform with intricate details",
        "stylish outfit with unique accessories", 
        "professional attire with special equipment",
        "adventure gear with practical elements",
        "artistic clothing with creative flair"
      ];
      return randomChoice(outfits);
    }
  };

  // 6. BACKGROUND ELEMENTS - Inspired by the flower/space example
  const backgrounds = [
    "vibrant flowers with detailed petals surrounding the character",
    "mesmerizing night sky filled with countless stars",
    "floating magical elements and sparkles",
    "technological interfaces and holographic displays",
    "crystal formations with ethereal lighting",
    "swirling energy patterns and light effects",
    "floating islands with mystical atmosphere",
    "underwater scene with bioluminescent creatures",
    "forest setting with glowing plants",
    "cosmic nebula with brilliant colors"
  ];
  const background = Math.random() > 0.3 ? randomChoice(backgrounds) : "";

  // 7. BUILD THE COMPLETE PROMPT - Following the astronaut example structure
  const promptStructures = [
    // Main structure based on the example: "captivating anime-style illustration of a woman in a white astronaut suit..."
    () => {
      const bgPart = background ? `. Surrounding the ${characterType} are ${background}. The background features ${background}` : "";
      return `${chosenStyle} of a ${characterType} with ${hairColor} ${hairStyle}. The character is wearing ${getOutfitDescription()}${bgPart}`;
    },
    
    // Alternative structure
    () => {
      const bgPart = background ? `, surrounded by ${background}` : "";
      return `${chosenStyle} featuring a ${characterType} character with beautiful ${hairColor} ${hairStyle}, dressed in ${getOutfitDescription()}${bgPart}`;
    },
    
    // Portrait focus
    () => {
      const bgPart = background ? ` with ${background} in the background` : "";
      return `detailed ${chosenStyle} portrait of a ${characterType} with ${hairColor} ${hairStyle} and ${getOutfitDescription()}${bgPart}`;
    }
  ];

  const promptBuilder = randomChoice(promptStructures);
  const prompt = promptBuilder();

  // 8. REFINED NEGATIVE PROMPT - Optimized for SD 3.5 quality
  const negative_prompt = "low quality, blurry, pixelated, distorted, deformed, ugly, bad anatomy, extra limbs, missing limbs, floating limbs, disconnected limbs, malformed hands, blur, out of focus, long neck, long body, mutated hands and fingers, out of frame, too many fingers, fused hand, bad proportions, unnatural body, unnatural skin, multiple characters, text, watermark, signature, username, logo, brand";

  console.log("\n--- Anime Character Prompt (SD 3.5) ---");
  console.log("🎯 Character Type:", characterType);
  console.log("💇 Hair:", `${hairColor} ${hairStyle}`);
  console.log("👔 Outfit:", getOutfitDescription());
  console.log("🌟 Background:", background || "minimal");
  console.log("🎨 Style:", chosenStyle);
  console.log("📝 Final Prompt:", prompt);
  console.log("🚫 Negative Prompt:", negative_prompt);

  return {
    prompt,
    negative_prompt,
    traits
  };
}

// If validateImage is not defined, define a stub for export
export function validateImage(_: ImageValidationData): string[] { return []; } 