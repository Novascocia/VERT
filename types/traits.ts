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

export interface SelectedTraits {
  HeadType: Trait;
  EyesFace: Trait;
  ClothingTop: Trait;
  CharacterColor: Trait;
  Species: Trait;
  Background: Trait;
  GraphicText?: Trait;
  rarity: string;
}

export interface PromptResult {
  prompt: string;
  negative_prompt: string;
  traits: SelectedTraits;
}

export interface ImageValidationData {
  background?: string;
  headShape?: string;
  hasHumanSkin: boolean;
  hasRealisticFeatures: boolean;
  hasBoldOutlines: boolean;
  hasCelShading: boolean;
  hasGradients: boolean;
  hasRealisticShading: boolean;
} 