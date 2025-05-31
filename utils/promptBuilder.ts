export function buildPrompt(traits: Record<string, any>): string {
  // Strong, modular prompt with explicit pose/placement and trait override
  const prompt = `2D digital cartoon mascot, cel-shaded, bold outlines. Character must be centered, upper-body, and match the pose and placement of the base image (for NFT collection consistency). Override the base image's face, head, clothing, and background with these traits:
Head: ${traits.HeadType?.description || 'unique stylized shape'}. Head must NOT be a dome, helmet, or orb. Use exaggerated, non-circular, non-helmet shapes. No goggles, no glass, no robot faces. If the head is round, add unique features: ears, horns, tape, cracks, or accessories.
Eyes: ${traits.EyesFace?.description || 'expressive cartoon features'}. Eyes must match this exactly. No goggles, no robot eyes, no blank eyes.
Clothing: ${traits.ClothingTop?.description || 'streetwear style'}. Clothing must match this exactly. No generic t-shirts, no random graphics.
Color: ${traits.CharacterColor?.description || 'vibrant cartoon colors'}
Species: ${traits.Species?.name || 'stylized mascot'}
Background: ${traits.Background?.description || 'stylized cartoon backdrop'}. Background must show this scene. No cityscapes, no skyscrapers, no generic urban scenes, no cars, no crowds.
Only visible text: 'VERT' in a bold, simple font as a patch or tag. No other words, letters, or logos.
No photorealism. No human faces or skin. No default helmets. No plain backgrounds.
Each character must have a unique head shape and structure not reused across generations. Do not use motorcycle helmet, Daft Punk helmet, astronaut helmet, or any reflective bubble design. Must follow this shape and style exactly. Do not override or simplify. This character must be visually distinct from others in the collection — vary silhouette, color blocks, and detail balance.`;
  return `${prompt} --safe, non-sexual, cartoon style, no nudity, no body parts, no inappropriate content, safe for all ages`;
} 