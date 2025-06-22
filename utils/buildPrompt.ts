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



// NFT-FOCUSED prompt building: Character-first, collectible-optimized
function buildLegacyPrompt(traits: SelectedTraits): PromptResult {
  
  // 1. EXPANDED SPECIES POOL - 50+ unique non-human characters
  const coolSpecies = [
    // Robotic/Mechanical
    "Robot", "Cyborg", "Android", "Mech Pilot", "Tech Warrior", "Circuit Being", "Data Entity", "Cyber Knight",
    "Steel Guardian", "Digital Warrior", "Nano Being", "Chrome Sentinel", "Tech Shaman", "Binary Ghost",
    
    // Mystical/Supernatural  
    "Ghost", "Spirit", "Phantom", "Shadow Being", "Wraith", "Specter", "Soul Walker", "Void Entity",
    "Dark Mage", "Crystal Being", "Energy Form", "Astral Warrior", "Mystic Guardian", "Rune Keeper",
    
    // Elemental/Natural
    "Fire Elemental", "Ice Elemental", "Storm Elemental", "Earth Elemental", "Lightning Being", "Flame Spirit",
    "Frost Guardian", "Wind Walker", "Stone Warrior", "Plasma Entity", "Magma Being", "Crystal Elemental",
    
    // Cosmic/Dimensional
    "Star Being", "Cosmic Entity", "Galaxy Guardian", "Void Walker", "Dimension Shifter", "Space Nomad",
    "Nebula Spirit", "Quantum Being", "Time Guardian", "Reality Bender", "Portal Keeper", "Cosmic Warrior",
    
    // Alien/Exotic
    "Alien Warrior", "Space Hunter", "Xenomorph", "Star Traveler", "Galactic Scout", "Void Hunter",
    "Plasma Alien", "Crystal Alien", "Energy Alien", "Bio-Mechanical Alien", "Hive Mind", "Star Seed",
    
    // Unique/Special
    "Hologram", "Digital Avatar", "Code Being", "Pixel Warrior", "Glitch Entity", "Data Ghost",
    "Neon Spirit", "Synthwave Being", "Retro Bot", "Arcade Guardian", "Game Spirit", "Virtual Warrior"
  ];
  
  // Always use a cool species (ignore original trait)
  const speciesName = randomChoice(coolSpecies);

  // 2. NFT-FOCUSED STYLES - Collectible character aesthetics
  const nftStyles = [
    "NFT character art",
    "collectible character design", 
    "digital collectible art",
    "anime NFT style",
    "cartoon NFT character",
    "stylized NFT avatar"
  ];
  const chosenStyle = randomChoice(nftStyles);

  // 3. CHARACTER-FIRST APPROACH - Always prioritize character over background
  const characterTraits = [
    { type: 'head', name: traits.HeadType.name, priority: 3 },
    { type: 'eyes', name: traits.EyesFace.name, priority: 2 },
    { type: 'clothing', name: traits.ClothingTop.name, priority: 2 },
    { type: 'color', name: traits.CharacterColor.name, priority: 1 }
  ];

  // Pick 1-2 most important character features
  const sortedTraits = characterTraits.sort((a, b) => b.priority - a.priority);
  const mainFeatures = sortedTraits.slice(0, 1 + Math.floor(Math.random() * 2)); // 1-2 features
  
  // Background is always subtle/minimal
  const backgroundHint = Math.random() > 0.7 ? `, ${traits.Background.name} background` : "";

     // 4. FULL CHARACTER PROMPTS - Ensure complete character generation
   const promptStructures = [
     // Full body character focus
     () => {
       const features = mainFeatures.map(t => t.name).join(', ');
       return `full body ${speciesName} character, ${features}, ${chosenStyle}${backgroundHint}`;
     },
     
     // Complete character design
     () => {
       const primary = mainFeatures[0].name;
       const secondary = mainFeatures.length > 1 ? `, ${mainFeatures[1].name}` : '';
       return `complete ${speciesName} character design with ${primary}${secondary}, ${chosenStyle}${backgroundHint}`;
     },
     
     // Standing character
     () => {
       const features = mainFeatures.map(t => t.name).join(', ');
       return `standing ${speciesName} character, ${features}, ${chosenStyle}${backgroundHint}`;
     },
     
     // Character portrait (full upper body)
     () => {
       const key = mainFeatures[0].name;
       return `${speciesName} character portrait, ${key}, full upper body, ${chosenStyle}${backgroundHint}`;
     }
   ];

  const promptBuilder = randomChoice(promptStructures);
  const prompt = promptBuilder();

     // 5. FULL CHARACTER NEGATIVE PROMPT - Prevent partial/cropped characters
   const negative_prompt = "human, human face, human skin, realistic person, real person, photorealistic human, human features, realistic skin, human anatomy, cropped, partial body, head only, face only, close-up, zoomed in, cut off, incomplete character, missing body parts, blurry, low quality, text, logos, brands, multiple characters, deformed, ugly";

  console.log("\n--- NFT Character Prompt ---");
  console.log(`Species: ${speciesName} (original: ${traits.Species.name})`);
  console.log(`Style: ${chosenStyle}`);
  console.log(`Main Features: ${mainFeatures.map(t => `${t.type}:${t.name}`).join(', ')}`);
  console.log(`Background: ${backgroundHint || 'minimal'}`);
  console.log(`Final: ${prompt}`);
  console.log("\n--- Anti-Human Negative ---");
  console.log(negative_prompt);

  return {
    prompt,
    negative_prompt,
    traits
  };
}

// If validateImage is not defined, define a stub for export
export function validateImage(_: ImageValidationData): string[] { return []; } 