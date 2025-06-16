import { ethers } from "ethers";
import nftProofArtifact from "./NFTProofAI.json";

const CONTRACT_ADDRESS = "0xD12395ee07a47c6aac6Ac44Cd526686A02FcF1a4";

export function getContract(signerOrProvider) {
    const abi = nftProofArtifact.abi;
  return new ethers.Contract(CONTRACT_ADDRESS, abi, signerOrProvider);
}
