import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Replicate from 'replicate';
import { writeFile } from 'fs/promises';
import dotenv from 'dotenv';
import axios from "axios";
import FormData from "form-data";
import { buildPrompt } from "../prompts/prompt_builder.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputsDir = path.join(__dirname, '../outputs');

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Ensure outputs directory exists
if (!fs.existsSync(outputsDir)) {
    fs.mkdirSync(outputsDir, { recursive: true });
}

// At the top, set the endpoint for SDXL text-to-image
const STABILITY_TEXT2IMG_ENDPOINT = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image";
const USE_CONTROL_IMAGE = false;

async function generateNFT() {
    try {
        // Get prompt, traits, and request data
        const { traits, validateImage } = buildPrompt(USE_CONTROL_IMAGE);

        // Build the prompt using traits
        const prompt = `Background: ${traits.Background?.description || 'urban alley'}. 
Background must be visible and match this description. 
Unique, collectible NFT creature in bold cartoon style. 
Character is NOT human, NOT a person, NOT a child, NOT realistic, NOT humanoid. 
Character is a unique, original, non-human, non-humanoid, non-person, non-child, non-adult, non-boy, non-girl, non-man, non-woman, non-teenager, non-baby, non-kid, non-cartoon human, non-cartoon person. 
No human face, no human skin, no human anatomy, no human proportions, no human body, no human features. 
Character must have a unique, non-human, non-humanoid, non-person, non-child, non-adult, non-boy, non-girl, non-man, non-woman, non-teenager, non-baby, non-kid, non-cartoon human, non-cartoon person silhouette and features. 
Creature, mascot, monster, alien, robot, animal, fantasy being, or abstract. 
Head: ${traits.HeadType?.description || 'unusual, not a helmet or orb'}. 
Eyes: ${traits.EyesFace?.description || 'distinctive cartoon eyes'}. 
Clothing: ${traits.ClothingTop?.description || 'streetwear'}. 
Color: ${traits.CharacterColor?.description || 'vivid, non-human'}. 
Species: ${traits.Species?.name || 'original'}. 
Only visible text: 'VERT'. 
Bold outlines, cel-shading, flat colors, no gradients, no photorealism.`;

        const negative_prompt = "human, person, child, realistic face, realistic skin, human anatomy, human proportions, human body, human smile, human nose, human mouth, human ears, human hair, human hands, human feet, human fingers, human toes, human eyes, human eyebrows, human teeth, human expression, human pose, human clothing, human style, human cartoon, humanoid, people, children, baby, kid, girl, boy, woman, man, adult, teenager, realistic, photorealistic, portrait, selfie, photo, 3D, Pixar, Disney, cartoon human, cartoon person, cartoon child, cartoon adult, cartoon boy, cartoon girl, cartoon man, cartoon woman, cartoon baby, cartoon kid, helmet, orb, robot, plain background, text: MFKZ, text: NFT, text: cartoon, text: character, text except 'VERT', logos, brand names, cityscape, cars, crowds, generic urban, street scene, motorcycles, goggles, robot eyes, robot face, gradients, smooth shading, realistic textures, hats, hoods, gloves, shoes, boots, sandals, socks, dull eyes, blank head, blank eyes, studio lighting, plain wall, photostudio, blank setting, plain t-shirt, generic shirt, studio portrait";

        const input = {
            prompt,
            negative_prompt: negative_prompt,
            num_inference_steps: 25,
            guidance_scale: 10,
            scheduler: "K_EULER_ANCESTRAL",
            width: 1024,
            height: 1024
        };

        const output = await replicate.run(
            "lucataco/dreamshaper-xl-turbo:0a1710e0187b01a255302738ca0158ff02a22f4638679533e111082f9dd1b615",
            { input }
        );

        // Save output
        for (const [index, item] of Object.entries(output)) {
            const timestamp = Date.now();
            const imageFilename = `character_${timestamp}_${index}.png`;
            const imagePath = path.join(outputsDir, imageFilename);
            await writeFile(imagePath, item);
            console.log("Image saved as", imagePath);

            // Save metadata
            const metadata = {
                traits,
                prompt,
                negative_prompt,
                image: imageFilename
            };
            const metadataFilename = `metadata_${timestamp}_${index}.json`;
            const metadataPath = path.join(outputsDir, metadataFilename);
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
            console.log("Metadata saved as", metadataPath);
        }

        // Validate image
        const imageData = {
            background: traits.Background?.name,
            headShape: traits.HeadType?.name,
            hasHumanSkin: false, // This would need to be determined by image analysis
            hasRealisticFeatures: false, // Check for realistic features
            hasBoldOutlines: true, // Should have bold outlines
            hasCelShading: true, // Should have cel-shading
            hasGradients: false, // Should not have gradients
            hasRealisticShading: false // Should not have realistic shading
        };
        
        const warnings = validateImage(imageData);
        if (warnings.length > 0) {
            console.warn("Image validation warnings:", warnings);
            // Move to rejects if needed
            if (warnings.some(w => w.includes("Reject"))) {
                for (const [index, item] of Object.entries(output)) {
                    const rejectPath = path.join(process.cwd(), "rejects", `reject_${Date.now()}_${index}.png`);
                    await writeFile(rejectPath, item);
                    console.log("Image moved to rejects:", rejectPath);
                }
            }
        }

    } catch (error) {
        console.error("Unexpected error generating NFT:", error.message);
        if (error.response) {
            console.log("API Response:", error.response.data);
        }
    }
}

// Run the generation
if (require.main === module) {
    generateNFT();
} 