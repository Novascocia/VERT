import { traits } from '../data/traits';
import { Trait, SelectedTraits, PromptResult, ImageValidationData } from '../types/traits';
import ArtRotationManager from './artRotationSystem';

// Helper: flatten all rarity buckets into a single array
function flattenTraitList(categoryObj: any): Trait[] {
  if (Array.isArray(categoryObj)) return categoryObj as Trait[];
  return Object.values(categoryObj).flat() as Trait[];
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// NEW: Get traits using current art period or fallback to legacy system
export function getRandomTraits(): SelectedTraits {
  const currentPeriod = ArtRotationManager.getCurrentPeriod();
  
  if (currentPeriod) {
    console.log(`🎨 Using art period: ${currentPeriod.name}`);
    return getRandomTraitsFromPeriod(currentPeriod);
  } else {
    console.log(`🎨 Using legacy trait system (no active period)`);
    return getLegacyRandomTraits();
  }
}

// NEW: Generate traits from a specific art period
function getRandomTraitsFromPeriod(period: any): SelectedTraits {
  const selectedTraits: Partial<SelectedTraits> = {};

  // Select from each category using weighted randomization
  Object.keys(period.traitPools).forEach(category => {
    const pool = period.traitPools[category];
    const totalWeight = pool.reduce((sum: number, trait: any) => sum + trait.weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const trait of pool) {
      currentWeight += trait.weight;
      if (random <= currentWeight) {
        // Convert to legacy format
        selectedTraits[category as keyof SelectedTraits] = {
          name: trait.name,
          description: trait.prompts[0] // Use first prompt as description
        } as any;
        break;
      }
    }
  });

  // Add GraphicText (always VERT for now)
  selectedTraits.GraphicText = { 
    name: "VERT", 
    description: "VERT text in bold, simple font as a patch or tag" 
  };

  // Assign rarity (using contract percentages)
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

  console.log("🎲 Final Selected Traits (Period):", selectedTraits);
  return selectedTraits as SelectedTraits;
}

// LEGACY: Original trait selection for backward compatibility
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

  const currentPeriod = ArtRotationManager.getCurrentPeriod();
  
  if (currentPeriod) {
    return buildPromptFromPeriod(currentPeriod, traits);
  } else {
    return buildLegacyPrompt(traits);
  }
}

// NEW: Build prompt using art period configuration
function buildPromptFromPeriod(period: any, traits: SelectedTraits): PromptResult {
  // Start with period base prompts
  const promptParts = [...period.basePrompts.positive];
  
  // Add trait-specific prompts
  const traitCategories = ['Species', 'HeadType', 'EyesFace', 'ClothingTop', 'CharacterColor', 'Background'];
  
  traitCategories.forEach(category => {
    const trait = traits[category as keyof SelectedTraits] as any;
    if (trait) {
      const periodTrait = period.traitPools[category]?.find((t: any) => t.name === trait.name);
      if (periodTrait && periodTrait.prompts) {
        // Use random prompt from the trait's prompt array for variation
        const randomPrompt = periodTrait.prompts[Math.floor(Math.random() * periodTrait.prompts.length)];
        promptParts.push(randomPrompt);
      }
    }
  });

  // Add style prompts
  promptParts.push(...period.basePrompts.style);
  
  // Add VERT text requirement
  promptParts.push(`wearing something that says '${traits.GraphicText?.name || "VERT"}'`);

  const prompt = promptParts.join(', ');
  const negative_prompt = period.basePrompts.negative.join(', ');

  console.log(`\n--- ${period.name} Prompt ---`);
  console.log(prompt);
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

// LEGACY: Original prompt building for backward compatibility
function buildLegacyPrompt(traits: SelectedTraits): PromptResult {
  // Place background at the start and make it explicit
  let prompt = `Background: ${traits.Background.description}. `;
  prompt += "Background must be visible and match this description. ";
  prompt += `Create a MFKZ-style NFT character with a ${traits.Species.name} appearance. `;
  prompt += `It has ${traits.EyesFace.name} and wears a ${traits.ClothingTop.name}. `;
  if (traits.CharacterColor?.name && traits.Species.name !== "Gold Hybrid") {
    prompt += `The character's theme includes the color ${traits.CharacterColor.name}. `;
  }
  prompt += "Cel-shaded bold cartoon style.";
  prompt += `, wearing something that says '${traits.GraphicText?.name || "VERT"}'`;

  // Negative prompt (keep strong for now)
  const negative_prompt = "human, child, realistic skin, realistic face, plain background, random logos, English words except VERT, photorealistic, default head, default face, default clothing, default background, realistic limbs, children, daft punk helmet, astronaut helmet, military helmet, bare skin, real person, shadow face, photoreal background, default head, realistic lighting, skin texture, hair, smooth face, depth of field, text, logos, brand names, realistic arms, fingers, helmets, motorcycle helmet, pilot helmet, round helmet, orb helmet, sunglasses, visors, reflections, leather texture, HDR, realistic shadows, photo, photograph, city photo, real buildings, windows, advertisements, brand logos, signs, tattoos, random words, foreign characters, visible numbers, random patches, realistic faces, empty background, gradient backdrop, gray backdrop, studio lighting, plain wall, photostudio, blank setting, plain t-shirt, generic shirt, studio portrait, dull eyes, simple head, blank head, blank eyes, photoreal background, people, motorcycles, empty photo studio, other text, unknown logos, English words other than 'VERT', cityscape, skyscraper, cars, crowds, generic urban, street scene, photo background, goggles, robot eyes, robot face";

  console.log("\n--- Legacy Prompt ---");
  console.log(prompt);
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