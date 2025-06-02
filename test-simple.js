// Simple test to isolate the issue
console.log('Starting simple NFT generation test...');

try {
  // Test 1: Can we import the buildPrompt module?
  console.log('Test 1: Importing buildPrompt...');
  const buildPromptModule = require('./utils/buildPrompt.ts');
  console.log('✅ buildPrompt imported successfully');
  console.log('Available exports:', Object.keys(buildPromptModule));

  // Test 2: Can we get random traits?
  console.log('\nTest 2: Getting random traits...');
  const traits = buildPromptModule.getRandomTraits();
  console.log('✅ Random traits generated:', JSON.stringify(traits, null, 2));

  // Test 3: Can we build a prompt?
  console.log('\nTest 3: Building prompt...');
  const promptResult = buildPromptModule.buildPrompt(traits);
  console.log('✅ Prompt built successfully');
  console.log('Prompt length:', promptResult.prompt.length);
  console.log('Negative prompt length:', promptResult.negative_prompt.length);

  console.log('\n✅ All tests passed! The buildPrompt system works locally.');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack:', error.stack);
} 