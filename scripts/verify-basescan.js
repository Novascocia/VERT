require("dotenv").config();
const fetch = require('node-fetch');
const fs = require('fs');

async function verifyContractOnBaseScan() {
  console.log("🔍 Verifying Vertical Project NFT Contract on BaseScan...");
  console.log("=".repeat(60));
  
  const contractAddress = "0x653015826EdbF26Fe61ad08E5220cD6150D9cB56";
  const virtualTokenAddress = "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b";
  const vertTokenAddress = process.env.VERT_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";
  const treasuryAddress = process.env.TREASURY_ADDRESS || "0x0000000000000000000000000000000000000000";
  
  console.log("📍 Contract Address:", contractAddress);
  console.log("🪙 VIRTUAL Token:", virtualTokenAddress);
  console.log("🎯 VERT Token:", vertTokenAddress);
  console.log("💰 Treasury:", treasuryAddress);
  console.log("");

  // First, check if already verified
  try {
    console.log("🔍 Checking if contract is already verified...");
    const checkResponse = await fetch(`https://api.basescan.org/api?module=contract&action=getsourcecode&address=${contractAddress}`);
    const checkData = await checkResponse.json();
    
    if (checkData.result && checkData.result[0] && checkData.result[0].SourceCode) {
      console.log("✅ Contract is already verified on BaseScan!");
      console.log("🔗 View at: https://basescan.org/address/" + contractAddress);
      return;
    }
    
    console.log("📝 Contract not yet verified, proceeding with verification...");
  } catch (error) {
    console.log("⚠️ Could not check verification status, proceeding with verification attempt...");
  }

  // Read the contract source code
  let sourceCode;
  try {
    sourceCode = fs.readFileSync('contracts/VerticalProjectNFT_Fixed.sol', 'utf8');
    console.log("✅ Contract source code loaded");
  } catch (error) {
    console.error("❌ Could not read contract source code:", error.message);
    console.log("💡 Make sure contracts/VerticalProjectNFT_Fixed.sol exists");
    return;
  }

  const baseScanApiKey = process.env.BASESCAN_API_KEY;
  if (!baseScanApiKey) {
    console.error("❌ BASESCAN_API_KEY not found in environment variables");
    console.log("💡 Get an API key from https://basescan.org/apis");
    return;
  }

  // Prepare verification data
  const verificationData = {
    module: 'contract',
    action: 'verifysourcecode',
    apikey: baseScanApiKey,
    contractaddress: contractAddress,
    sourceCode: sourceCode,
    codeformat: 'solidity-single-file',
    contractname: 'VerticalProjectNFT',
    compilerversion: 'v0.8.24+commit.e11b9ed9', // Update this to match your compiler
    optimizationUsed: 0,
    runs: 200,
    constructorArguements: '', // Will be encoded if needed
    evmversion: 'paris'
  };

  console.log("📤 Submitting contract for verification...");
  console.log("⚙️ Compiler version:", verificationData.compilerversion);
  console.log("🔧 Optimization:", verificationData.optimizationUsed ? 'Yes' : 'No');
  console.log("");

  try {
    const formData = new URLSearchParams();
    Object.keys(verificationData).forEach(key => {
      formData.append(key, verificationData[key]);
    });

    const response = await fetch('https://api.basescan.org/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    const result = await response.json();
    console.log("📋 BaseScan Response:", result);

    if (result.status === "1" && result.result) {
      console.log("✅ Verification submitted successfully!");
      console.log("📄 GUID:", result.result);
      console.log("");
      console.log("⏳ Checking verification status...");
      
      // Wait a moment then check status
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusResponse = await fetch(`https://api.basescan.org/api?module=contract&action=checkverifystatus&guid=${result.result}&apikey=${baseScanApiKey}`);
      const statusResult = await statusResponse.json();
      
      console.log("📋 Verification Status:", statusResult);
      
      if (statusResult.result === "Pass - Verified") {
        console.log("🎉 CONTRACT SUCCESSFULLY VERIFIED!");
        console.log("🔗 View verified contract: https://basescan.org/address/" + contractAddress);
      } else if (statusResult.result === "Pending in queue") {
        console.log("⏳ Verification is pending, check back in a few minutes");
        console.log("🔗 Check status: https://basescan.org/address/" + contractAddress);
      } else {
        console.log("⚠️ Verification status:", statusResult.result);
        console.log("💡 You may need to manually verify at: https://basescan.org/verifyContract");
      }
      
    } else {
      console.error("❌ Verification submission failed:", result.message);
      console.log("💡 You may need to manually verify at: https://basescan.org/verifyContract");
      
      if (result.message?.includes("Already Verified")) {
        console.log("✅ Contract is already verified!");
        console.log("🔗 View at: https://basescan.org/address/" + contractAddress);
      }
    }

  } catch (error) {
    console.error("❌ Error during verification:", error.message);
    console.log("💡 You can manually verify at: https://basescan.org/verifyContract");
  }

  console.log("");
  console.log("📝 Manual Verification Info:");
  console.log("   Contract Address:", contractAddress);
  console.log("   Contract Name: VerticalProjectNFT");
  console.log("   Compiler: Solidity 0.8.24");
  console.log("   Optimization: No");
  console.log("   Constructor Args: VIRTUAL, VERT, Treasury addresses");
  console.log("");
  console.log("🔗 Manual verification URL: https://basescan.org/verifyContract");
}

verifyContractOnBaseScan()
  .then(() => {
    console.log("🏁 Verification process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Verification failed:", error);
    process.exit(1);
  }); 