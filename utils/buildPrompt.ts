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



// Optimized prompt building with dynamic structure and focused generation
function buildLegacyPrompt(traits: SelectedTraits): PromptResult {
  // 1. STYLE VARIATION - Random art styles instead of always "MFKZ-style"
  const artStyles = [
    "anime style",
    "cartoon style", 
    "digital art style",
    "cel-shaded style",
    "manga style",
    "stylized illustration"
  ];
  const chosenStyle = randomChoice(artStyles);

  // 2. FOCUSED GENERATION - Pick 1-2 main traits to emphasize
  const allTraits = [
    { type: 'species', name: traits.Species.name },
    { type: 'head', name: traits.HeadType.name },
    { type: 'eyes', name: traits.EyesFace.name },
    { type: 'clothing', name: traits.ClothingTop.name },
    { type: 'color', name: traits.CharacterColor.name },
    { type: 'background', name: traits.Background.name }
  ];
  
  // Randomly pick 2-3 traits to emphasize
  const shuffledTraits = allTraits.sort(() => Math.random() - 0.5);
  const emphasizedTraits = shuffledTraits.slice(0, 2 + Math.floor(Math.random() * 2)); // 2-3 traits
  const subtleTraits = shuffledTraits.slice(emphasizedTraits.length);

     // 3. DYNAMIC STRUCTURE - Randomize prompt order and format
   const promptStructures = [
     // Character-focused
     () => {
       const main = emphasizedTraits.map(t => t.name).join(', ');
       const subtle = subtleTraits.length > 0 ? `, ${subtleTraits.map(t => t.name).join(', ')}` : '';
       return `${traits.Species.name} character, ${main}${subtle}, ${chosenStyle}, VERT text`;
     },
     
     // Background-focused  
     () => {
       const bg = traits.Background.name;
       const char = emphasizedTraits.filter(t => t.type !== 'background').map(t => t.name).join(', ');
       return `${traits.Species.name} character in ${bg} background, ${char}, ${chosenStyle}, VERT text`;
     },
     
     // Balanced approach
     () => {
       const parts = [`${traits.Species.name} character`];
       parts.push(...emphasizedTraits.map(t => t.name));
       parts.push(chosenStyle);
       parts.push('VERT text');
       return parts.join(', ');
     },
     
     // Minimal approach
     () => {
       const key = emphasizedTraits.slice(0, 2).map(t => t.name).join(', ');
       return `${traits.Species.name} character, ${key}, ${chosenStyle}, VERT text`;
     }
   ];

  // 4. SIMPLIFIED PROMPTS - Use trait names instead of descriptions
  const promptBuilder = randomChoice(promptStructures);
  const prompt = promptBuilder();

  // 5. FOCUSED NEGATIVE PROMPT - Shorter, more targeted
  const negative_prompt = "realistic, photorealistic, human face, human skin, blurry, low quality, text other than VERT, logos, brands, multiple characters, deformed";

  console.log("\n--- Optimized Prompt ---");
  console.log(`Style: ${chosenStyle}`);
  console.log(`Emphasized: ${emphasizedTraits.map(t => `${t.type}:${t.name}`).join(', ')}`);
  console.log(`Subtle: ${subtleTraits.map(t => `${t.type}:${t.name}`).join(', ')}`);
  console.log(`Final: ${prompt}`);
  console.log("\n--- Negative Prompt ---");
  console.log(negative_prompt);
  console.log("\n--- Traits ---");
  console.log(JSON.stringify(traits, null, 2));

  return {
    prompt,
    negative_prompt,
    traits
  };
}

// If validateImage is not defined, define a stub for export
export function validateImage(_: ImageValidationData): string[] { return []; } 