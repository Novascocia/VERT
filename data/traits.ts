export interface Trait {
  name: string;
  description: string;
  compatibility_notes?: string;
  rarity?: string;
}

export interface TraitCategory {
  Common: Trait[];
  Rare: Trait[];
  Epic: Trait[];
  Legendary: Trait[];
  Mythical: Trait[];
}

export interface TraitsData {
  HeadType: TraitCategory;
  EyesFace: TraitCategory;
  ClothingTop: TraitCategory;
  CharacterColor: TraitCategory;
  Species: TraitCategory;
  Background: TraitCategory;
  GraphicText?: Trait[];
}

// Import the JSON data
const traitsData = require('../traits/verticals_with_charactercolor.json');

// Validate the data structure
function validateTraitsData(data: any): data is TraitsData {
  const requiredCategories = ['HeadType', 'EyesFace', 'ClothingTop', 'CharacterColor', 'Species', 'Background'];
  const requiredRarities = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythical'];

  // Check if all required categories exist
  for (const category of requiredCategories) {
    if (!data[category]) {
      console.error(`Missing category: ${category}`);
      return false;
    }

    // Check if all required rarities exist for each category
    for (const rarity of requiredRarities) {
      if (!data[category][rarity] || !Array.isArray(data[category][rarity])) {
        console.error(`Missing or invalid rarity ${rarity} in category ${category}`);
        return false;
      }

      // Check if each trait has required fields
      for (const trait of data[category][rarity]) {
        if (!trait.name || !trait.description) {
          console.error(`Invalid trait in ${category}.${rarity}:`, trait);
          return false;
        }
      }
    }
  }

  return true;
}

// Validate and export the data
if (!validateTraitsData(traitsData)) {
  throw new Error('Invalid traits data structure');
}

export const traits: TraitsData = traitsData; 