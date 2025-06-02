console.log('Testing buildPrompt system...');

try {
  const { getRandomTraits, buildPrompt } = require('./utils/buildPrompt.ts');
  console.log('✅ Successfully imported buildPrompt functions');
  
  const traits = getRandomTraits();
  console.log('✅ Traits generated:', traits);
  
  const prompt = buildPrompt(traits);
  console.log('✅ Prompt built successfully:', prompt.substring(0, 100) + '...');
  
} catch (error) {
  console.error('❌ Error testing buildPrompt:', error.message);
  console.error('Full error:', error);
} 