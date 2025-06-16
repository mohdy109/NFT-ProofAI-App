// // lib/nft.js
// import axios from 'axios';

// const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

// export async function uploadToIPFSAndMintNFT(imageFile, summary, address) {
//   const metadata = {
//     name: 'Event Summary',
//     description: summary,
//     image: imageFile.name,
//     timestamp: new Date().toISOString(),
//   };

//   // 1. Upload the image
//   const imageForm = new FormData();
//   imageForm.append('file', imageFile);

//   const imageRes = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', imageForm, {
//     maxBodyLength: Infinity,
//     headers: {
//       'Content-Type': 'multipart/form-data',
//       Authorization: `Bearer ${PINATA_JWT}`,
//     },
//   });

//   const imageCID = imageRes.data.IpfsHash;
//   const imageUrl = `ipfs://${imageCID}`;

//   // 2. Upload metadata
//   const fullMetadata = {
//     ...metadata,
//     image: imageUrl,
//   };

//   const metadataRes = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', fullMetadata, {
//     headers: {
//       Authorization: `Bearer ${PINATA_JWT}`,
//     },
//   });

//   const metadataCID = metadataRes.data.IpfsHash;
//   const metadataUrl = `ipfs://${metadataCID}`;

//   // 3. Optionally mint NFT here using ethers.js
//   // const provider = new ethers.providers.Web3Provider(window.ethereum);
//   // const signer = provider.getSigner();
//   // const contract = new ethers.Contract(contractAddress, contractABI, signer);
//   // const tx = await contract.mintNFT(address, metadataUrl);

//   return {
//     image: URL.createObjectURL(imageFile),
//     summary,
//     timestamp: new Date().toISOString(),
//     ipfsImageUrl: imageUrl,
//     ipfsMetadataUrl: metadataUrl,
//   };
// }


import { classifyImage } from "./blip";

export async function handleImageUpload(file) {
  if (!signed) {
    alert("Please sign the wallet before uploading.");
    return;
  }

  setImage(file);
  setImageUrl(URL.createObjectURL(file));

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
      },
      body: formData,
    });

    const pinataRes = await res.json();
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${pinataRes.IpfsHash}`;

    const classification = await classifyImage(ipfsUrl);
    setLabels(classification);
  } catch (err) {
    console.error("Image processing failed:", err);
  }
}
