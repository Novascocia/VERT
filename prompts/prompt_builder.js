import fs from 'fs';
import path from 'path';

const traitsFile = path.join(process.cwd(), 'traits', 'verticals_with_charactercolor.json');
const headTypeLogFile = path.join(process.cwd(), 'logs', 'head_type_frequency.json');
const baseMascotPath = path.join(process.cwd(), 'assets', 'base.png');
const rejectsDir = path.join(process.cwd(), 'rejects');

// Ensure required directories exist
try {
    const dirs = ['logs', 'rejects'];
    dirs.forEach(dir => {
        const dirPath = path.join(process.cwd(), dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    });
} catch (error) {
    console.error('Failed to create required directories:', error);
}

// Load and parse the traits
const traitsData = JSON.parse(fs.readFileSync(traitsFile, 'utf8'));

// Initialize or load head type frequency tracking
let headTypeFrequency = {};

// Ensure logs directory exists
try {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    if (fs.existsSync(headTypeLogFile)) {
        headTypeFrequency = JSON.parse(fs.readFileSync(headTypeLogFile, 'utf8'));
    }
} catch (error) {
    console.warn('Could not initialize head type frequency tracking:', error);
}

// Helper: flatten rarity groups into a single array
function flattenTraitList(categoryObj) {
    if (Array.isArray(categoryObj)) return categoryObj;
    return Object.values(categoryObj).flat();
}

function getRandomTraits() {
    const traitsData = JSON.parse(fs.readFileSync(traitsFile, "utf8"));
    const selectedTraits = {};

    // Process each category
    for (const category of Object.keys(traitsData)) {
        const categoryData = traitsData[category];
        const traitList = flattenTraitList(categoryData);

        if (traitList.length > 0) {
            const randomIndex = Math.floor(Math.random() * traitList.length);
            selectedTraits[category] = traitList[randomIndex];
            console.log(`Selected ${category}:`, selectedTraits[category]?.name || selectedTraits[category]?.description);
        } else {
            console.warn(`No traits found for category: ${category}`);
        }
    }

    console.log("Final Selected Traits:", selectedTraits);
    return selectedTraits;
}

function logHeadTypeFrequency(headTypeName) {
    try {
        headTypeFrequency[headTypeName] = (headTypeFrequency[headTypeName] || 0) + 1;
        
        // Log if frequency exceeds threshold
        if (headTypeFrequency[headTypeName] > 5) {
            console.warn(`Warning: HeadType "${headTypeName}" has been used ${headTypeFrequency[headTypeName]} times`);
        }
        
        // Save updated frequency
        fs.writeFileSync(headTypeLogFile, JSON.stringify(headTypeFrequency, null, 2));
    } catch (error) {
        console.warn('Could not save head type frequency:', error);
    }
}

function validateImage(imageData) {
    const warnings = [];
    
    // Check for background
    if (!imageData.background || imageData.background === 'empty') {
        warnings.push("Warning: background trait may have failed.");
    }
    
    // Check for helmet shape
    if (imageData.headShape === 'default' || imageData.headShape === 'helmet') {
        warnings.push("Retry: HeadType ignored.");
    }
    
    // Check for human skin
    if (imageData.hasHumanSkin) {
        warnings.push("Reject image and log as invalid.");
    }
    
    return warnings;
}

function buildPrompt(useControlImage = true) {
    const traits = getRandomTraits();

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

    const negative_prompt = "human, child, realistic skin, realistic face, plain background, random logos, English words except VERT, photorealistic, default head, default face, default clothing, default background, realistic limbs, children, daft punk helmet, astronaut helmet, military helmet, bare skin, real person, shadow face, photoreal background, default head, realistic lighting, skin texture, hair, smooth face, depth of field, text, logos, brand names, realistic arms, fingers, helmets, motorcycle helmet, pilot helmet, round helmet, orb helmet, sunglasses, visors, reflections, leather texture, HDR, realistic shadows, photo, photograph, city photo, real buildings, windows, advertisements, brand logos, signs, tattoos, random words, foreign characters, visible numbers, random patches, realistic faces, empty background, gradient backdrop, gray backdrop, studio lighting, plain wall, photostudio, blank setting, plain t-shirt, generic shirt, studio portrait, dull eyes, simple head, blank head, blank eyes, photoreal background, people, motorcycles, empty photo studio, other text, unknown logos, English words other than 'VERT', cityscape, skyscraper, cars, crowds, generic urban, street scene, photo background, goggles, robot eyes, robot face";

    // Read base mascot image if needed
    let baseMascotImage = null;
    if (useControlImage) {
        try {
            baseMascotImage = fs.createReadStream(path.join(process.cwd(), "assets", "base.png"));
        } catch (error) {
            console.error('Failed to read base mascot image:', error);
            throw new Error('Base mascot image is required for generation');
        }
    }

    // Build the API request structure
    const request = {
        prompt,
        negative_prompt,
        style_preset: "digital-art",
        output_format: "png",
        width: 1024,
        height: 1024,
        cfg_scale: 8
    };
    if (useControlImage) {
        request.image = baseMascotImage;
        request.control_strength = 0.5;
    }

    // Log generation details
    console.log('Generation Details:', {
        traits: Object.fromEntries(
            Object.entries(traits).map(([key, value]) => [key, value.name || value.description])
        ),
        prompt,
        negative_prompt
    });

    return {
        request,
        traits,
        validateImage
    };
}

export { buildPrompt, getRandomTraits, validateImage }; 