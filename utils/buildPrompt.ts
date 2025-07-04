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

  // Species: User-selected mix of creatures, monsters, and character archetypes
  const expandedSpecies = [
    // 👻 Creatures & Monsters
    { name: "Ghost", description: "Translucent spirit with ethereal glow" },
    { name: "Alien", description: "Extraterrestrial being with otherworldly features" },
    { name: "Demon", description: "Horned infernal being with claws and fangs" },
    { name: "Dragon", description: "Scaled reptilian being with horns and draconic features" },
    { name: "Angel", description: "Celestial being with wings and divine radiance" },
    { name: "Phantom", description: "Spectral being with wispy form" },
    { name: "Zombie", description: "Undead creature with decaying features" },
    { name: "Vampire", description: "Pale immortal being with fangs and dark elegance" },
    { name: "Werewolf", description: "Wolf-human hybrid with lupine features" },
    { name: "Golem", description: "Animated stone or clay creature" },
    { name: "Cyclops", description: "Giant humanoid with single large eye" },
    { name: "Slime", description: "Gelatinous blob creature with fluid form" },
    { name: "Goblin", description: "Small green-skinned creature with pointed ears" },
    { name: "Beast", description: "Wild creature with animal-like features" },
    { name: "Mushroom", description: "Fungal creature with cap and spores" },
    
    // 🤖 Non-Human Entities
    { name: "Robot", description: "Mechanical being with visible joints and metallic surfaces" },
    { name: "Astronaut", description: "Space explorer in protective suit and helmet" },
    
    // 🧍‍♂️ Human-like Roles (Classes / Archetypes)
    { name: "Samurai", description: "Japanese warrior in traditional armor" },
    { name: "Ninja", description: "Stealthy warrior in dark clothing and mask" },
    { name: "Knight", description: "Armored medieval warrior with sword and shield" },
    { name: "Wizard", description: "Magical practitioner with robes and staff" },
    { name: "Witch", description: "Magical being with pointed hat and mystical powers" },
    { name: "Pirate", description: "Seafaring adventurer with tricorn hat and cutlass" },
    { name: "Viking", description: "Norse warrior with horned helmet and axe" },
    { name: "Mage", description: "Spellcaster with arcane knowledge and magical attire" },
    { name: "Shaman", description: "Spiritual guide with tribal clothing and totems" },
    { name: "King", description: "Royal ruler with crown and regal robes" },
    { name: "Queen", description: "Royal monarch with crown and elegant dress" },
    { name: "Jester", description: "Court entertainer with colorful outfit and bells" },
    { name: "Clown", description: "Performer with painted face and bright costume" },
    { name: "Plague Doctor", description: "Medieval physician with bird-like mask" },
    { name: "Gladiator", description: "Arena fighter with armor and combat weapons" }
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
  
  // Use the actual species from traits directly (no random mapping)
  let characterType = traits.Species.name.toLowerCase();
  
  // Only replace if it's human
  if (characterType === "human") {
    characterType = randomChoice(speciesTypes);
  }
  
  // Keep the original species name for consistency
  // This ensures "Plasma Life" stays as "plasma life", not random mapping

  // 2. ANIME/CARTOON VISUAL STYLES - Optimized for SDXL-Lightning
  const visualStyles = [
    "anime style",
    "cartoon style", 
    "anime art",
    "cartoon art",
    "anime illustration",
    "cartoon illustration",
    "anime character art",
    "cartoon character art",
    "stylized anime",
    "stylized cartoon",
    "cel-shaded anime",
    "cel-shaded cartoon"
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

  // 7. SPECIES-SPECIFIC NON-HUMAN FEATURES - Force non-human appearance
  const getSpeciesFeatures = () => {
    // Mechanical/Robotic
    if (characterType.includes("robot") || characterType.includes("android") || characterType.includes("cyborg") || characterType.includes("ai construct") || characterType.includes("nano swarm")) {
      return "with visible mechanical parts, glowing LED eyes, metallic skin patches, circuit patterns, and robotic joints";
    }
    // Mythical Creatures
    else if (characterType.includes("dragon")) {
      return "with reptilian scales, draconic horns, slitted eyes, clawed hands, and dragon-like features";
    } else if (characterType.includes("phoenix")) {
      return "with fiery feathers, flame-like hair, burning eyes, and bird-like features";
    } else if (characterType.includes("griffin") || characterType.includes("pegasus") || characterType.includes("unicorn")) {
      return "with animal features, non-human anatomy, and mythical creature characteristics";
    }
    // Supernatural Entities
    else if (characterType.includes("ghost") || characterType.includes("phantom") || characterType.includes("wraith") || characterType.includes("banshee")) {
      return "with translucent ethereal form, glowing spectral aura, wispy appearance, and ghostly features";
    }
    // Elemental Beings
    else if (characterType.includes("elemental") || characterType.includes("fire") || characterType.includes("ice") || characterType.includes("storm") || characterType.includes("earth") || characterType.includes("water") || characterType.includes("shadow") || characterType.includes("light")) {
      return "with elemental energy emanating from their form, non-solid matter composition, and elemental manifestation";
    }
         // Alien Species
     else if (characterType.includes("alien") || characterType.includes("tentacle") || characterType.includes("insectoid") || characterType.includes("crystalline") || characterType.includes("gaseous")) {
       return "with completely alien anatomy, non-human facial structure, extraterrestrial features, and otherworldly characteristics";
     }
     // Plasma/Energy Beings
     else if (characterType.includes("plasma") || characterType.includes("energy")) {
       return "with plasma energy form, glowing energy body, crackling electrical aura, and pure energy manifestation";
     }
    // Demonic/Infernal
    else if (characterType.includes("demon") || characterType.includes("imp") || characterType.includes("succubus") || characterType.includes("hellhound") || characterType.includes("gargoyle")) {
      return "with demonic horns, clawed hands, fanged teeth, otherworldly features, and infernal characteristics";
    }
    // Cosmic Entities
    else if (characterType.includes("star") || characterType.includes("nebula") || characterType.includes("quantum") || characterType.includes("void") || characterType.includes("dimension") || characterType.includes("black hole")) {
      return "with cosmic energy patterns, stellar matter composition, reality-bending features, and incomprehensible form";
    }
    // Nature Spirits
    else if (characterType.includes("ent") || characterType.includes("golem") || characterType.includes("djinn") || characterType.includes("mushroom") || characterType.includes("coral") || characterType.includes("crystal")) {
      return "with natural material composition, plant-like or mineral features, non-flesh anatomy, and nature spirit characteristics";
    }
    // Aberrant/Eldritch
    else if (characterType.includes("eldritch") || characterType.includes("lovecraftian") || characterType.includes("horror") || characterType.includes("nightmare") || characterType.includes("glitch")) {
      return "with impossible geometry, too many eyes, tentacle appendages, reality-defying features, and cosmic horror characteristics";
    }
         // Default for any other species
     else {
       return "with clearly non-human anatomy, fantastical features, otherworldly appearance, completely inhuman characteristics, non-human facial structure, and alien-like traits";
     }
  };

  // 8. TINY CHARACTER PROMPTS - User-selected fun and relatable scenarios
  const tinyScenarios = [
    "floating on a leaf boat",
    "popping out of a gift box",
    "crawling out of a book",
    "jumping on a jellybean",
    "floating in a soda bottle",
    "holding onto a balloon string",
    "inside a snow globe",
    "standing on a cupcake",
    "resting in a seashell",
    "sitting on a dice cube",
    "riding a paper airplane",
    "tucked in a sandwich",
    "hiding in a popcorn bucket",
    "playing on a button",
    "resting on a toothbrush",
    "standing on a CD/DVD",
    "riding a paper boat",
    "inside a fortune cookie",
    "balancing on a chess piece",
    "crawling through a donut hole",
    "riding a rubber duck",
    "perched on a french fry",
    "hatching from an egg",
    "riding on a leaf",
    "perched on a mushroom"
  ];
  
  const tinyEnvironments = [
    "in a candy world",
    "inside a terrarium",
    "on a lily pad in a pond",
    "inside a bottle at sea",
    "on top of a record player",
    "on a chessboard",
    "on a tree stump",
    "among tall grass",
    "in a kitchen sink",
    "on a paper map",
    "in a desert with giant pebbles",
    "on a cracked sidewalk",
    "floating through space junk",
    "on a giant clock",
    "on a fruit slice",
    "on a giant hand",
    "in a carnival scene",
    "on the moon",
    "on a cloud",
    "in a starry void"
  ];
  
  const scenario = randomChoice(tinyScenarios);
  const environment = randomChoice(tinyEnvironments);
  
  // Force cartoon/anime style in all prompts
  const cartoonStyles = [
    "cartoon style",
    "anime style", 
    "cute cartoon",
    "kawaii anime",
    "chibi style",
    "stylized cartoon",
    "anime character",
    "cartoon character",
    "cel-shaded",
    "animated style"
  ];
  const chosenCartoonStyle = randomChoice(cartoonStyles);

  const promptStructures = [
    // Tiny character scenarios with forced cartoon style
    () => {
      return `${chosenCartoonStyle} tiny ${characterType} ${scenario} ${environment}`;
    },
    
    // Alternative tiny format with cartoon style
    () => {
      return `${chosenCartoonStyle} tiny ${characterType} with ${hairColor} ${hairStyle} ${scenario} ${environment}`;
    },
    
    // Simple tiny character with cartoon style
    () => {
      return `${chosenCartoonStyle} tiny cute ${characterType} ${environment}`;
    }
  ];

  const promptBuilder = randomChoice(promptStructures);
  const prompt = promptBuilder();

  console.log("\n--- Tiny Character Prompt (SANA) ---");
  console.log("🧬 Original Species:", traits.Species.name);
  console.log("🎯 Tiny Character:", characterType);
  console.log("🎨 Art Style:", chosenCartoonStyle);
  console.log("💇 Hair:", `${hairColor} ${hairStyle}`);
  console.log("🎬 Scenario:", scenario);
  console.log("🌍 Environment:", environment);
  console.log("📝 Final Prompt:", prompt);

  return {
    prompt,
    negative_prompt: "", // SANA doesn't use negative prompts
    traits
  };
}

// If validateImage is not defined, define a stub for export
export function validateImage(_: ImageValidationData): string[] { return []; } 