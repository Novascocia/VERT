require('dotenv').config();
const axios = require('axios');

// Test Art Period Configuration
const TEST_PERIOD = {
  id: 'mystic-ocean-2025',
  name: 'Mystic Ocean Depths',
  description: 'Underwater fantasy realm with bioluminescent creatures and coral kingdoms',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-31'),
  isActive: false, // Test only
  retired: false,
  model: {
    name: 'FLUX.1 Pro',
    version: '1.0',
    replicateModel: 'black-forest-labs/flux-pro:f2ab8a5569cd01b72ca8b7dbec5e6c3c8d87bd3d4a7c31e59ff0d8e207c5e6cb',
    settings: {
      steps: 25,
      guidance: 8.0,
      scheduler: 'K_EULER'
    }
  },
  traitPools: {
    Species: [
      { name: 'Coral Sage', weight: 35, prompts: ['wise coral being', 'reef elder', 'living coral humanoid'] },
      { name: 'Deep Dweller', weight: 30, prompts: ['abyssal creature', 'deep sea inhabitant', 'oceanic entity'] },
      { name: 'Pearl Guardian', weight: 20, prompts: ['pearl protector', 'oceanic guardian', 'shell keeper'] },
      { name: 'Tide Walker', weight: 15, prompts: ['wave master', 'tidal being', 'current rider'] }
    ],
    HeadType: [
      { name: 'Coral Crown', weight: 40, prompts: ['living coral crown', 'reef headpiece', 'sea anemone hair'] },
      { name: 'Pearl Circlet', weight: 30, prompts: ['luminous pearl crown', 'oceanic circlet', 'deep sea tiara'] },
      { name: 'Kelp Wreath', weight: 20, prompts: ['flowing kelp hair', 'seaweed crown', 'algae wreath'] },
      { name: 'Shell Helm', weight: 10, prompts: ['conch shell helmet', 'nautilus crown', 'shell warrior helm'] }
    ],
    EyesFace: [
      { name: 'Bioluminescent', weight: 35, prompts: ['glowing bio eyes', 'luminescent gaze', 'deep sea glow'] },
      { name: 'Pearl Eyes', weight: 25, prompts: ['iridescent pearl eyes', 'mother-of-pearl gaze', 'lustrous orbs'] },
      { name: 'Ocean Blue', weight: 25, prompts: ['deep ocean blue eyes', 'sea blue gaze', 'aquatic eyes'] },
      { name: 'Coral Pattern', weight: 15, prompts: ['coral skin patterns', 'reef markings', 'living coral face'] }
    ],
    ClothingTop: [
      { name: 'Kelp Robe', weight: 35, prompts: ['flowing kelp garments', 'seaweed robes', 'algae clothing'] },
      { name: 'Shell Armor', weight: 30, prompts: ['conch shell armor', 'protective shell mail', 'sea shell plates'] },
      { name: 'Coral Dress', weight: 20, prompts: ['living coral gown', 'reef dress', 'coral formation clothing'] },
      { name: 'Pearl Net', weight: 15, prompts: ['pearl mesh garments', 'luminous net clothing', 'oceanic chainmail'] }
    ],
    CharacterColor: [
      { name: 'Turquoise Glow', weight: 30, prompts: ['turquoise bioluminescence', 'aqua glow', 'cyan luminescence'] },
      { name: 'Coral Pink', weight: 25, prompts: ['coral pink hues', 'reef pink', 'salmon coral'] },
      { name: 'Deep Purple', weight: 25, prompts: ['abyssal purple', 'deep sea violet', 'oceanic purple'] },
      { name: 'Pearl White', weight: 20, prompts: ['iridescent white', 'pearl luminescence', 'mother-of-pearl sheen'] }
    ],
    Background: [
      { name: 'Coral Palace', weight: 35, prompts: ['underwater coral palace', 'reef castle', 'living coral architecture'] },
      { name: 'Abyssal Depths', weight: 30, prompts: ['deep ocean trench', 'abyssal plain', 'dark ocean depths'] },
      { name: 'Kelp Forest', weight: 20, prompts: ['giant kelp forest', 'underwater forest', 'seaweed jungle'] },
      { name: 'Pearl Grotto', weight: 15, prompts: ['luminous pearl cave', 'glowing underwater grotto', 'bioluminescent cavern'] }
    ]
  },
  basePrompts: {
    positive: [
      'underwater fantasy art',
      'bioluminescent lighting',
      'oceanic atmosphere',
      'mystical sea creatures',
      'ethereal underwater scene',
      'detailed digital art'
    ],
    negative: [
      'dry land',
      'desert',
      'fire',
      'terrestrial',
      'above water',
      'blurry',
      'low quality'
    ],
    style: [
      'fantasy underwater art',
      'bioluminescent aesthetic',
      'oceanic mysticism'
    ]
  }
};

// Simulation functions
function selectRandomTraits(period) {
  const traits = {};
  
  Object.keys(period.traitPools).forEach(category => {
    const pool = period.traitPools[category];
    const totalWeight = pool.reduce((sum, trait) => sum + trait.weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const trait of pool) {
      currentWeight += trait.weight;
      if (random <= currentWeight) {
        traits[category] = trait;
        break;
      }
    }
  });
  
  return traits;
}

function buildTestPrompt(period, traits) {
  const promptParts = [...period.basePrompts.positive];
  
  Object.values(traits).forEach(trait => {
    if (trait.prompts) {
      // Use first prompt from each trait
      promptParts.push(trait.prompts[0]);
    }
  });
  
  promptParts.push(...period.basePrompts.style);
  
  return {
    positive: promptParts.join(', '),
    negative: period.basePrompts.negative.join(', '),
    model: period.model.replicateModel,
    settings: period.model.settings
  };
}

async function testArtPeriod() {
  console.log('🎨 TESTING NEW ART PERIOD');
  console.log('='.repeat(60));
  console.log(`📅 Period: ${TEST_PERIOD.name}`);
  console.log(`📝 Description: ${TEST_PERIOD.description}`);
  console.log(`🤖 Model: ${TEST_PERIOD.model.name}`);
  console.log(`⚙️  Settings:`, TEST_PERIOD.model.settings);
  
  console.log('\n🎲 TRAIT DISTRIBUTION TEST');
  console.log('='.repeat(40));
  
  // Test trait distribution
  const distributions = {};
  Object.keys(TEST_PERIOD.traitPools).forEach(category => {
    distributions[category] = {};
    TEST_PERIOD.traitPools[category].forEach(trait => {
      distributions[category][trait.name] = 0;
    });
  });
  
  const testCount = 1000;
  for (let i = 0; i < testCount; i++) {
    const traits = selectRandomTraits(TEST_PERIOD);
    Object.keys(traits).forEach(category => {
      distributions[category][traits[category].name]++;
    });
  }
  
  // Display distribution results
  Object.keys(distributions).forEach(category => {
    console.log(`\n${category}:`);
    Object.keys(distributions[category]).forEach(traitName => {
      const count = distributions[category][traitName];
      const percentage = (count / testCount * 100).toFixed(1);
      const expectedTrait = TEST_PERIOD.traitPools[category].find(t => t.name === traitName);
      const expected = expectedTrait ? expectedTrait.weight : 0;
      console.log(`  ${traitName.padEnd(15)}: ${percentage.padStart(5)}% (expected: ${expected}%)`);
    });
  });
  
  console.log('\n🖼️  SAMPLE PROMPTS');
  console.log('='.repeat(40));
  
  // Generate sample prompts
  for (let i = 1; i <= 5; i++) {
    const traits = selectRandomTraits(TEST_PERIOD);
    const prompt = buildTestPrompt(TEST_PERIOD, traits);
    
    console.log(`\nSample ${i}:`);
    console.log(`Traits: ${Object.keys(traits).map(key => `${key}: ${traits[key].name}`).join(', ')}`);
    console.log(`Prompt: ${prompt.positive}`);
    console.log(`Negative: ${prompt.negative}`);
  }
  
  console.log('\n📊 PERIOD ANALYSIS');
  console.log('='.repeat(40));
  
  // Analyze the period
  const totalTraits = Object.keys(TEST_PERIOD.traitPools).reduce((sum, category) => {
    return sum + TEST_PERIOD.traitPools[category].length;
  }, 0);
  
  const totalCombinations = Object.keys(TEST_PERIOD.traitPools).reduce((product, category) => {
    return product * TEST_PERIOD.traitPools[category].length;
  }, 1);
  
  console.log(`Total trait categories: ${Object.keys(TEST_PERIOD.traitPools).length}`);
  console.log(`Total individual traits: ${totalTraits}`);
  console.log(`Possible combinations: ${totalCombinations.toLocaleString()}`);
  console.log(`Model inference time: ~${TEST_PERIOD.model.settings.steps * 0.2}s per image`);
  
  console.log('\n✅ PERIOD VALIDATION');
  console.log('='.repeat(40));
  
  const issues = [];
  
  // Check for trait balance
  Object.keys(TEST_PERIOD.traitPools).forEach(category => {
    const weights = TEST_PERIOD.traitPools[category].map(t => t.weight);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    if (totalWeight !== 100) {
      issues.push(`${category} weights don't sum to 100 (current: ${totalWeight})`);
    }
  });
  
  // Check for prompt quality
  const hasEmptyPrompts = Object.values(TEST_PERIOD.traitPools).some(category =>
    category.some(trait => !trait.prompts || trait.prompts.length === 0)
  );
  
  if (hasEmptyPrompts) {
    issues.push('Some traits have empty prompt arrays');
  }
  
  if (issues.length > 0) {
    console.log('❌ Issues found:');
    issues.forEach(issue => console.log(`  • ${issue}`));
  } else {
    console.log('✅ All validations passed!');
    console.log('🚀 This period is ready for deployment');
  }
  
  console.log('\n🔄 NEXT STEPS');
  console.log('='.repeat(40));
  console.log('1. Review sample prompts above');
  console.log('2. Test generate a few actual images using these prompts');
  console.log('3. Adjust trait weights if needed');
  console.log('4. Add period to ART_PERIODS array when ready');
  console.log('5. Set isActive: true when period should go live');
}

// Function to generate actual test images (requires Replicate API)
async function generateTestImages() {
  if (!process.env.REPLICATE_API_TOKEN) {
    console.log('\n⚠️  Set REPLICATE_API_TOKEN to test actual image generation');
    return;
  }
  
  console.log('\n🖼️  GENERATING TEST IMAGES');
  console.log('='.repeat(40));
  
  try {
    for (let i = 1; i <= 3; i++) {
      const traits = selectRandomTraits(TEST_PERIOD);
      const prompt = buildTestPrompt(TEST_PERIOD, traits);
      
      console.log(`\nGenerating test image ${i}...`);
      console.log(`Traits: ${Object.keys(traits).map(key => traits[key].name).join(', ')}`);
      
      // This would call Replicate API
      // const response = await axios.post('https://api.replicate.com/v1/predictions', {
      //   version: prompt.model,
      //   input: {
      //     prompt: prompt.positive,
      //     negative_prompt: prompt.negative,
      //     ...prompt.settings
      //   }
      // });
      
      console.log(`✅ Test image ${i} prompt ready`);
      console.log(`   Prompt: ${prompt.positive.substring(0, 100)}...`);
    }
  } catch (error) {
    console.error('Error generating test images:', error.message);
  }
}

// Run the tests
testArtPeriod();
generateTestImages(); 