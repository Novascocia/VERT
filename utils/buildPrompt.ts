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



// Simplified trait selection - Species-focused
function getLegacyRandomTraits(): SelectedTraits {
  const selectedTraits: Partial<SelectedTraits> = {};

  // Only generate essential traits for compatibility, but focus on Species
  selectedTraits.HeadType = { name: "Generated", description: "AI-generated head style" };
  selectedTraits.EyesFace = { name: "Generated", description: "AI-generated eye style" };
  selectedTraits.ClothingTop = { name: "Generated", description: "AI-generated clothing" };
  selectedTraits.CharacterColor = { name: "Generated", description: "AI-generated colors" };
  selectedTraits.Background = { name: "Generated", description: "AI-generated background" };
  selectedTraits.GraphicText = { name: "None", description: "No text overlay" };

  // Species: THIS IS THE IMPORTANT ONE - expand the species list
  const expandedSpecies = [
    // From original traits file
    { name: "Robot", description: "Mechanical humanoid with visible joints and metallic surfaces" },
    { name: "Cyborg", description: "Half-human, half-machine hybrid being" },
    { name: "Ghost", description: "Ethereal spirit with translucent appearance" },
    { name: "Alien", description: "Extraterrestrial being with unique features" },
    
    // NEW SPECIES - 50+ more options
    { name: "Dragon", description: "Majestic draconic being with scales and power" },
    { name: "Phoenix", description: "Fiery bird-like creature with rebirth abilities" },
    { name: "Android", description: "Advanced artificial being with human-like appearance" },
    { name: "Elemental", description: "Being made of pure elemental energy" },
    { name: "Demon", description: "Dark supernatural entity with otherworldly powers" },
    { name: "Angel", description: "Divine being with celestial features" },
    { name: "Vampire", description: "Immortal blood-drinking creature of the night" },
    { name: "Werewolf", description: "Shape-shifting wolf-human hybrid" },
    { name: "Fairy", description: "Magical winged being with nature powers" },
    { name: "Elf", description: "Graceful pointed-eared magical humanoid" },
    { name: "Dwarf", description: "Sturdy underground-dwelling craftsperson" },
    { name: "Orc", description: "Powerful warrior with tribal markings" },
    { name: "Troll", description: "Large primitive being with regenerative abilities" },
    { name: "Goblin", description: "Small mischievous creature with cunning intelligence" },
    { name: "Wizard", description: "Arcane spellcaster with mystical knowledge" },
    { name: "Witch", description: "Magic user with potion-brewing abilities" },
    { name: "Necromancer", description: "Dark magic user who commands the undead" },
    { name: "Shapeshifter", description: "Being capable of changing their physical form" },
    { name: "Time Traveler", description: "Entity that exists across multiple timelines" },
    { name: "Dimension Walker", description: "Being that can traverse between realities" },
    { name: "Star Guardian", description: "Cosmic protector with stellar powers" },
    { name: "Void Entity", description: "Creature from the empty spaces between worlds" },
    { name: "Crystal Being", description: "Living entity made of crystalline structures" },
    { name: "Shadow Assassin", description: "Stealth warrior who controls darkness" },
    { name: "Lightning Mage", description: "Spellcaster who wields electrical storms" },
    { name: "Ice Queen", description: "Regal being with dominion over winter" },
    { name: "Fire Lord", description: "Powerful entity that commands flames" },
    { name: "Earth Shaman", description: "Nature spirit connected to the ground" },
    { name: "Wind Dancer", description: "Graceful being who moves with the air" },
    { name: "Water Sage", description: "Wise entity with mastery over liquids" },
    { name: "Space Pirate", description: "Cosmic outlaw with advanced technology" },
    { name: "Quantum Scientist", description: "Researcher who manipulates reality itself" },
    { name: "Bio-Engineer", description: "Creator of living technological hybrids" },
    { name: "Hologram", description: "Projected consciousness with digital form" },
    { name: "AI Construct", description: "Artificial intelligence given physical form" },
    { name: "Nano Swarm", description: "Collective consciousness of microscopic machines" },
    { name: "Energy Being", description: "Pure energy given sentient form" },
    { name: "Plasma Entity", description: "Superheated matter with consciousness" },
    { name: "Dark Matter", description: "Invisible force made manifest" },
    { name: "Cosmic Horror", description: "Incomprehensible entity from beyond space" },
    { name: "Dream Walker", description: "Being that exists in the realm of sleep" },
    { name: "Memory Keeper", description: "Entity that stores and protects forgotten knowledge" },
    { name: "Soul Collector", description: "Mysterious being that gathers spiritual essence" },
    { name: "Reality Hacker", description: "Digital entity that rewrites existence" },
    { name: "Probability Manipulator", description: "Being that controls chance and luck" },
    { name: "Multiverse Guardian", description: "Protector of infinite parallel worlds" }
  ];

  selectedTraits.Species = randomChoice(expandedSpecies);

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

  console.log("🎲 Generated Species:", selectedTraits.Species?.name, `(${selectedTraits.rarity})`);
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



// SPECIES-FOCUSED prompt building: Based on SD 3.5 and astronaut example
function buildLegacyPrompt(traits: SelectedTraits): PromptResult {
  
  // 1. EXPANDED SPECIES TYPES - 100+ unique non-human species
  const speciesTypes = [
    // Robotic/Mechanical (20)
    "robot", "cyborg", "android", "mech pilot", "tech warrior", "circuit being", "data entity", "cyber knight",
    "steel guardian", "digital warrior", "nano being", "chrome sentinel", "tech shaman", "binary ghost",
    "quantum robot", "plasma android", "neural cyborg", "bio-mech", "techno-spirit", "code construct",
    
    // Mystical/Supernatural (20)
    "ghost", "spirit", "phantom", "shadow being", "wraith", "specter", "soul walker", "void entity",
    "dark mage", "crystal being", "energy form", "astral warrior", "mystic guardian", "rune keeper",
    "dream weaver", "nightmare entity", "ethereal being", "psychic entity", "mind reader", "soul guardian",
    
    // Elemental/Natural (20)
    "fire elemental", "ice elemental", "storm elemental", "earth elemental", "lightning being", "flame spirit",
    "frost guardian", "wind walker", "stone warrior", "plasma entity", "magma being", "crystal elemental",
    "water spirit", "nature guardian", "forest keeper", "mountain spirit", "ocean dweller", "sky dancer", "lava demon", "thunder god",
    
    // Cosmic/Dimensional (20)
    "star being", "cosmic entity", "galaxy guardian", "void walker", "dimension shifter", "space nomad",
    "nebula spirit", "quantum being", "time guardian", "reality bender", "portal keeper", "cosmic warrior",
    "stellar traveler", "universe keeper", "black hole entity", "comet rider", "asteroid miner", "solar flare", "cosmic dust", "supernova",
    
    // Alien/Exotic (20)
    "alien warrior", "space hunter", "xenomorph", "star traveler", "galactic scout", "void hunter",
    "plasma alien", "crystal alien", "energy alien", "bio-mechanical alien", "hive mind", "star seed",
    "tentacle being", "multi-eyed creature", "shapeshifter", "phase alien", "gravity manipulator", "time alien", "psychic alien", "crystal harvester",
    
    // Fantasy Creatures (20)
    "dragon", "phoenix", "griffin", "unicorn", "pegasus", "sphinx", "chimera", "basilisk",
    "wyvern", "drake", "fairy", "pixie", "elf", "dwarf", "orc", "goblin", "troll", "ogre", "demon", "angel"
  ];
  
  // Use the actual species from traits, but map it to our expanded list if it's "Robot" or similar
  let characterType = traits.Species.name.toLowerCase();
  
  // If it's a basic species, enhance it with our expanded list
  if (characterType === "robot") {
    const robotTypes = speciesTypes.filter(s => s.includes("robot") || s.includes("android") || s.includes("cyborg") || s.includes("mech"));
    characterType = randomChoice(robotTypes);
  } else if (characterType === "human") {
    // Replace human with random non-human species
    characterType = randomChoice(speciesTypes);
  } else {
    // Try to find a matching enhanced version, or use a random one
    const matching = speciesTypes.find(s => s.includes(characterType)) || randomChoice(speciesTypes);
    characterType = matching;
  }

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

  // 5. SPECIES-SPECIFIC OUTFIT STYLES
  const getOutfitDescription = () => {
    // Robotic/Mechanical
    if (characterType.includes("robot") || characterType.includes("android") || characterType.includes("cyborg") || characterType.includes("mech")) {
      return randomChoice([
        "metallic armor with glowing circuits",
        "sleek tech suit with energy cores",
        "industrial gear with mechanical parts",
        "chrome plating with LED accents"
      ]);
    }
    // Mystical/Supernatural
    else if (characterType.includes("ghost") || characterType.includes("spirit") || characterType.includes("phantom") || characterType.includes("mage")) {
      return randomChoice([
        "flowing ethereal robes with magical auras",
        "mystical garments with glowing runes",
        "translucent clothing with energy wisps",
        "ancient robes with arcane symbols"
      ]);
    }
    // Elemental
    else if (characterType.includes("elemental") || characterType.includes("fire") || characterType.includes("ice") || characterType.includes("storm")) {
      return randomChoice([
        "elemental armor that shifts with their power",
        "natural clothing made of their element",
        "energy-based garments that glow",
        "crystalline outfit that reflects their nature"
      ]);
    }
    // Cosmic/Space
    else if (characterType.includes("cosmic") || characterType.includes("star") || characterType.includes("space") || characterType.includes("nebula")) {
      return randomChoice([
        "starlight-woven cosmic robes",
        "space suit with nebula patterns",
        "stellar armor with constellation designs",
        "void-touched garments with galaxy swirls"
      ]);
    }
    // Alien
    else if (characterType.includes("alien") || characterType.includes("xenomorph") || characterType.includes("tentacle")) {
      return randomChoice([
        "bio-organic suit that adapts to their form",
        "alien tech gear with unknown materials",
        "living armor that pulses with life",
        "exotic clothing from their homeworld"
      ]);
    }
    // Fantasy Creatures
    else if (characterType.includes("dragon") || characterType.includes("phoenix") || characterType.includes("griffin") || characterType.includes("fairy")) {
      return randomChoice([
        "magical attire befitting their legendary status",
        "enchanted garments with mythical properties",
        "regal clothing with fantasy elements",
        "nature-inspired outfit with magical details"
      ]);
    }
    // Default for other species
    else {
      return randomChoice([
        "unique outfit that reflects their species",
        "specialized gear suited to their nature",
        "distinctive clothing with species-specific details",
        "custom attire that enhances their abilities"
      ]);
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

  console.log("\n--- Species-Focused Prompt (SD 3.5) ---");
  console.log("🧬 Original Species:", traits.Species.name);
  console.log("🎯 Enhanced Species:", characterType);
  console.log("💇 Hair:", `${hairColor} ${hairStyle}`);
  console.log("👔 Outfit:", getOutfitDescription());
  console.log("🌟 Background:", background || "minimal");
  console.log("📝 Final Prompt:", prompt);

  return {
    prompt,
    negative_prompt,
    traits
  };
}

// If validateImage is not defined, define a stub for export
export function validateImage(_: ImageValidationData): string[] { return []; } 