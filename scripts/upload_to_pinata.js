import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_BASE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

if (!PINATA_JWT) {
  console.error('Missing PINATA_JWT in .env');
  process.exit(1);
}

async function uploadFileToPinata(filePath) {
  const data = new FormData();
  data.append('file', fs.createReadStream(filePath));

  const res = await axios.post(PINATA_BASE_URL, data, {
    maxBodyLength: Infinity,
    headers: {
      ...data.getHeaders(),
      Authorization: `Bearer ${PINATA_JWT}`,
    },
  });
  return res.data.IpfsHash;
}

async function uploadToPinata(imagePath, metadataPath) {
  // Upload image
  const imageHash = await uploadFileToPinata(imagePath);
  const imageIpfsUrl = `ipfs://${imageHash}`;
  console.log('Image uploaded to:', imageIpfsUrl);

  // Read and update metadata
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  metadata.image = imageIpfsUrl;

  // Write updated metadata to a temp file
  const tempMetadataPath = path.join(
    path.dirname(metadataPath),
    `temp_${path.basename(metadataPath)}`
  );
  fs.writeFileSync(tempMetadataPath, JSON.stringify(metadata, null, 2));

  // Upload metadata
  const metadataHash = await uploadFileToPinata(tempMetadataPath);
  const metadataIpfsUrl = `ipfs://${metadataHash}`;
  console.log('Metadata uploaded to:', metadataIpfsUrl);

  // Clean up temp file
  fs.unlinkSync(tempMetadataPath);

  return metadataIpfsUrl;
}

// CLI usage: node scripts/upload_to_pinata.js <imagePath> <metadataPath>
if (require.main === module) {
  const [,, imagePath, metadataPath] = process.argv;
  if (!imagePath || !metadataPath) {
    console.error('Usage: node scripts/upload_to_pinata.js <imagePath> <metadataPath>');
    process.exit(1);
  }
  uploadToPinata(imagePath, metadataPath)
    .then((url) => {
      console.log('Final metadata IPFS URL:', url);
    })
    .catch((err) => {
      console.error('Upload failed:', err.message);
      process.exit(1);
    });
}

export { uploadToPinata }; 