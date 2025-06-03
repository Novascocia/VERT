import { SelectedTraits } from '../types/traits';

export interface ArtPeriod {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  model: {
    name: string;
    version: string;
    replicateModel: string;
    settings: {
      steps: number;
      guidance: number;
      scheduler: string;
    };
  };
  traitPools: {
    Species: Array<{ name: string; weight: number; prompts: string[] }>;
    HeadType: Array<{ name: string; weight: number; prompts: string[] }>;
    EyesFace: Array<{ name: string; weight: number; prompts: string[] }>;
    ClothingTop: Array<{ name: string; weight: number; prompts: string[] }>;
    CharacterColor: Array<{ name: string; weight: number; prompts: string[] }>;
    Background: Array<{ name: string; weight: number; prompts: string[] }>;
  };
  basePrompts: {
    positive: string[];
    negative: string[];
    style: string[];
  };
  retired: boolean; // Never to be used again
}

// Example art periods - each one is unique and never repeats
export const ART_PERIODS: ArtPeriod[] = [
  {
    id: 'genesis-cyberpunk',
    name: 'Genesis: Cyberpunk Era',
    description: 'The original cyberpunk aesthetic that started it all',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    isActive: false,
    retired: true, // This was the original launch period
    model: {
      name: 'DreamShaper XL Turbo',
      version: '1.0',
      replicateModel: 'lucataco/dreamshaper-xl-turbo:0a1710e0187b01a255302738ca0158ff02a22f4638679533e111082f9dd1b615',
      settings: {
        steps: 25,
        guidance: 10,
        scheduler: 'K_EULER_ANCESTRAL'
      }
    },
    traitPools: {
      Species: [
        { name: 'Human Cyborg', weight: 40, prompts: ['cybernetic human', 'augmented person', 'cyber-enhanced human'] },
        { name: 'Android', weight: 30, prompts: ['humanoid robot', 'synthetic being', 'artificial humanoid'] },
        { name: 'Alien Hybrid', weight: 20, prompts: ['extraterrestrial being', 'alien-human hybrid', 'otherworldly entity'] },
        { name: 'AI Avatar', weight: 10, prompts: ['digital consciousness', 'virtual being', 'holographic entity'] }
      ],
      HeadType: [
        { name: 'Neural Interface', weight: 35, prompts: ['neural implants', 'brain-computer interface', 'cybernetic crown'] },
        { name: 'Holographic', weight: 25, prompts: ['holographic head', 'digital projection', 'light-based form'] },
        { name: 'Mechanized', weight: 25, prompts: ['robotic head', 'mechanical skull', 'android cranium'] },
        { name: 'Organic Plus', weight: 15, prompts: ['enhanced human head', 'bio-augmented', 'evolved human'] }
      ],
      // ... continue with other traits
      EyesFace: [
        { name: 'LED Eyes', weight: 30, prompts: ['glowing LED eyes', 'illuminated optics', 'cyber eyes'] },
        { name: 'Scanner Eyes', weight: 25, prompts: ['scanning red eyes', 'targeting systems', 'HUD eyes'] },
        { name: 'Holographic Face', weight: 25, prompts: ['projected face', 'digital features', 'light-based face'] },
        { name: 'Enhanced Human', weight: 20, prompts: ['augmented human face', 'bio-enhanced features'] }
      ],
      ClothingTop: [
        { name: 'Tech Suit', weight: 35, prompts: ['high-tech bodysuit', 'cybernetic armor', 'neural suit'] },
        { name: 'Holo Jacket', weight: 30, prompts: ['holographic jacket', 'digital clothing', 'light-based attire'] },
        { name: 'Corporate Wear', weight: 20, prompts: ['futuristic business suit', 'corporate cyber attire'] },
        { name: 'Street Tech', weight: 15, prompts: ['cyberpunk street wear', 'hacker clothing', 'underground tech'] }
      ],
      CharacterColor: [
        { name: 'Neon Blue', weight: 30, prompts: ['electric blue', 'cyan glow', 'neon blue lighting'] },
        { name: 'Matrix Green', weight: 25, prompts: ['digital green', 'matrix code green', 'phosphor green'] },
        { name: 'Cyber Purple', weight: 25, prompts: ['neon purple', 'violet glow', 'electric purple'] },
        { name: 'Chrome Silver', weight: 20, prompts: ['metallic silver', 'chrome finish', 'reflective metal'] }
      ],
      Background: [
        { name: 'Neon City', weight: 35, prompts: ['cyberpunk cityscape', 'neon-lit streets', 'futuristic metropolis'] },
        { name: 'Data Stream', weight: 30, prompts: ['flowing data streams', 'digital matrix', 'code environment'] },
        { name: 'Circuit Board', weight: 20, prompts: ['electronic circuits', 'motherboard patterns', 'tech grid'] },
        { name: 'Cyber Space', weight: 15, prompts: ['virtual reality space', 'digital dimension', 'cyber realm'] }
      ]
    },
    basePrompts: {
      positive: [
        'cyberpunk aesthetic',
        'high-tech futuristic',
        'neon lighting',
        'digital art style',
        'sci-fi character design'
      ],
      negative: [
        'medieval',
        'fantasy',
        'natural lighting',
        'photorealistic',
        'blurry',
        'low quality'
      ],
      style: [
        'cyberpunk art style',
        'futuristic digital art',
        'neon-noir aesthetic'
      ]
    }
  },
  
  {
    id: 'steam-renaissance',
    name: 'Steam Renaissance',
    description: 'Steampunk meets Renaissance art - brass, gears, and classical beauty',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-31'),
    isActive: true, // Currently active period
    retired: false,
    model: {
      name: 'SDXL Lightning',
      version: '2.0',
      replicateModel: 'bytedance/sdxl-lightning-4step:727e49a643e999d602a896c774a0658ffb7725a5a2ad1e66e6b7ecc33772e506',
      settings: {
        steps: 4,
        guidance: 7.5,
        scheduler: 'DPM_SOLVER'
      }
    },
    traitPools: {
      Species: [
        { name: 'Steam Noble', weight: 35, prompts: ['aristocratic steampunk figure', 'noble inventor', 'brass aristocrat'] },
        { name: 'Gear Artisan', weight: 30, prompts: ['mechanical craftsperson', 'clockwork engineer', 'gear artisan'] },
        { name: 'Aether Mystic', weight: 20, prompts: ['steam-powered mystic', 'ethereal engineer', 'mystical inventor'] },
        { name: 'Brass Guardian', weight: 15, prompts: ['mechanical guardian', 'brass automaton', 'steam sentinel'] }
      ],
      HeadType: [
        { name: 'Gear Crown', weight: 40, prompts: ['clockwork crown', 'brass gear headpiece', 'mechanical diadem'] },
        { name: 'Steam Mask', weight: 30, prompts: ['ornate steam mask', 'brass breathing apparatus', 'decorative respirator'] },
        { name: 'Cogwheel Halo', weight: 20, prompts: ['rotating gear halo', 'clockwork nimbus', 'mechanical aureole'] },
        { name: 'Renaissance Hair', weight: 10, prompts: ['classical curls with gears', 'ornate braids with brass', 'period hair with clockwork'] }
      ],
      EyesFace: [
        { name: 'Brass Monocle', weight: 35, prompts: ['ornate brass monocle', 'clockwork eyepiece', 'steam-powered lens'] },
        { name: 'Gear Eyes', weight: 25, prompts: ['clockwork iris', 'brass mechanical eyes', 'gear-operated optics'] },
        { name: 'Noble Gaze', weight: 25, prompts: ['aristocratic features', 'renaissance beauty', 'classical elegance'] },
        { name: 'Steam Marks', weight: 15, prompts: ['brass facial decorations', 'clockwork tattoos', 'mechanical scarification'] }
      ],
      ClothingTop: [
        { name: 'Brass Corset', weight: 35, prompts: ['ornate brass corset', 'clockwork bodice', 'mechanical stays'] },
        { name: 'Steam Coat', weight: 30, prompts: ['elaborate steampunk coat', 'brass-buttoned jacket', 'gear-decorated overcoat'] },
        { name: 'Noble Vest', weight: 20, prompts: ['aristocratic waistcoat', 'ornate steam vest', 'classical steampunk attire'] },
        { name: 'Inventor Apron', weight: 15, prompts: ['brass-studded apron', 'craftsman garments', 'workshop attire'] }
      ],
      CharacterColor: [
        { name: 'Antique Brass', weight: 40, prompts: ['warm brass tones', 'antique metal', 'golden brass'] },
        { name: 'Rich Copper', weight: 30, prompts: ['deep copper', 'oxidized metal', 'warm reddish-brown'] },
        { name: 'Steam White', weight: 20, prompts: ['ivory white', 'steam vapor white', 'classical marble'] },
        { name: 'Deep Mahogany', weight: 10, prompts: ['rich wood tones', 'dark mahogany', 'warm brown'] }
      ],
      Background: [
        { name: 'Clockwork Workshop', weight: 40, prompts: ['inventor workshop', 'gear-filled laboratory', 'clockwork factory'] },
        { name: 'Steam Palace', weight: 30, prompts: ['ornate steam palace', 'brass architecture', 'mechanical mansion'] },
        { name: 'Gear Garden', weight: 20, prompts: ['mechanical garden', 'clockwork greenhouse', 'steam-powered conservatory'] },
        { name: 'Aether Chamber', weight: 10, prompts: ['mystical steam chamber', 'ethereal workshop', 'alchemical laboratory'] }
      ]
    },
    basePrompts: {
      positive: [
        'steampunk renaissance style',
        'ornate brass details',
        'clockwork mechanisms',
        'classical beauty',
        'warm lighting',
        'detailed craftsmanship'
      ],
      negative: [
        'modern technology',
        'digital elements',
        'plastic materials',
        'neon colors',
        'blurry',
        'low quality'
      ],
      style: [
        'renaissance steampunk art',
        'classical mechanical aesthetic',
        'ornate brass styling'
      ]
    }
  }
];

// System functions
export class ArtRotationManager {
  static getCurrentPeriod(): ArtPeriod | null {
    const now = new Date();
    return ART_PERIODS.find(period => 
      period.isActive && 
      now >= period.startDate && 
      now <= period.endDate &&
      !period.retired
    ) || null;
  }

  static getUpcomingPeriod(): ArtPeriod | null {
    const now = new Date();
    return ART_PERIODS
      .filter(period => period.startDate > now && !period.retired)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0] || null;
  }

  static getAllPeriods(): ArtPeriod[] {
    return ART_PERIODS.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  static getRetiredPeriods(): ArtPeriod[] {
    return ART_PERIODS.filter(period => period.retired);
  }

  static addNewPeriod(period: ArtPeriod): void {
    // Ensure no overlap with existing periods
    const hasOverlap = ART_PERIODS.some(existing => 
      (period.startDate >= existing.startDate && period.startDate <= existing.endDate) ||
      (period.endDate >= existing.startDate && period.endDate <= existing.endDate)
    );
    
    if (hasOverlap) {
      throw new Error('New period overlaps with existing period');
    }

    ART_PERIODS.push(period);
  }

  static retirePeriod(periodId: string): void {
    const period = ART_PERIODS.find(p => p.id === periodId);
    if (period) {
      period.retired = true;
      period.isActive = false;
    }
  }

  // Test a period without making it active
  static testPeriod(period: ArtPeriod, testTraits: SelectedTraits): string {
    // This would generate a test prompt using the period's settings
    return this.buildPromptForPeriod(period, testTraits);
  }

  static buildPromptForPeriod(period: ArtPeriod, traits: SelectedTraits): string {
    const speciesPrompts = period.traitPools.Species.find(s => s.name === traits.Species.name)?.prompts || [];
    const headPrompts = period.traitPools.HeadType.find(h => h.name === traits.HeadType.name)?.prompts || [];
    
    // Combine prompts using the period's style
    const prompt = [
      ...period.basePrompts.positive,
      ...speciesPrompts,
      ...headPrompts,
      ...period.basePrompts.style
    ].join(', ');

    return prompt;
  }
}

export default ArtRotationManager; 