import React, { useEffect, useState } from "react";
import styled from "styled-components";
import CameraInput from "@/components/CameraInput";
import EventList from "@/components/EventList";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { classifyImage } from "./lib/blip";
import { ethers } from "ethers";
import { getContract } from "./lib/contract";

const Container = styled.div`
  padding: 1rem;
  max-width: 700px;
  margin: auto;
  font-family: "Arial", sans-serif;
`;

const Button = styled.button`
  background-color: #0070f3;
  color: white;
  padding: 0.75rem 1.2rem;
  margin: 0.5rem 0;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;

  &:hover {
    background-color: #005bb5;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ImagePreview = styled.img`
  width: 100%;
  border-radius: 8px;
  margin-top: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  border: 1px solid #ccc;
`;

const InfoText = styled.p`
  font-size: 0.9rem;
  color: #555;
`;

const StatusCard = styled.div`
  background-color: #e6f9ec;
  border-left: 5px solid #2ecc71;
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 10px;
`;

const StatusHeader = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #27ae60;
`;

const StatusText = styled.p`
  margin: 0.3rem 0;
  font-size: 0.95rem;
  color: #333;
  word-break: break-all;
`;

const Copyable = styled.span`
  background: #f4f4f4;
  padding: 0.2rem 0.4rem;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background: #e2e2e2;
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-top: 1rem;
`;

const Header = styled.h1`
  font-size: 2.4rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const SubHeader = styled.p`
  font-size: 1.1rem;
  color: #7f8c8d;
  max-width: 600px;
  margin: auto;
`;
export default function Home() {
  const [events, setEvents] = useState([]);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageIpfsUrl, setImageIpfsUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [signed, setSigned] = useState(false);
  const [labels, setLabels] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [resetCounter, setResetCounter] = useState(0);

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();


  const { signMessage } = useSignMessage({
    message: "Sign to prove ownership of your wallet.",
    onSuccess(signature) {
      console.log("Signature success:", signature);
      setSigned(true);
    },
    onError(error) {
      console.error("Signature failed or rejected:", error);
      setSigned(false);
    },
  });

  useEffect(() => {
    if (isConnected && !signed) {
      requestSignature();
    }
  }, [isConnected, signed]);

  async function requestSignature() {
    try {
      await signMessage();
    } catch (err) {
      console.error("Signature rejected or failed:", err);
    }
  }


  async function mintNFT(tokenURI) {
    if (!window.ethereum) return alert("Wallet not found");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = getContract(signer);

    const tx = await contract.mint(address, tokenURI);
    const receipt = await tx.wait();

    const tokenId = receipt.logs[0]?.topics[3];
    setConfirmation({ tokenId });
    console.log("Minted NFT with Token ID:", tokenId);

    setEvents((prev) => [
      ...prev,
      {
        image: imageIpfsUrl,
        summary,
        timestamp: Date.now(),
      },
    ]);

    setImage(null);
    setImageUrl("");
    setImageIpfsUrl("");
    setSummary("");
    setLabels([]);
    setSelectedLabel("");
  }

  async function handleImageUpload(file) {
    if (!signed) {
      alert("Please sign the wallet before uploading.");
      return;
    }

    setImage(file);
    setImageUrl(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
          },
          body: formData,
        }
      );

      const pinataRes = await res.json();
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${pinataRes.IpfsHash}`;

      setImageIpfsUrl(ipfsUrl);

      const classification = await classifyImage(ipfsUrl);
      setLabels(classification);

      if (classification.length > 0) {
        const top = classification[0];
        setSelectedLabel(top.label);
        setSummary(`This image appears to be: ${top.label}`);
      }
    } catch (err) {
      console.error("Image upload or classification failed:", err);
    } finally {
      setUploading(false);
    }
  }

  async function handleMint() {
    if (!image || !selectedLabel || !summary || !signed || !address) return;
    setMinting(true);
    try {
      const metadata = {
        name: selectedLabel,
        description: summary,
        image: imageIpfsUrl,
      };

      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
          },
          body: JSON.stringify(metadata),
        }
      );

      const metaRes = await res.json();
      const tokenURI = `https://gateway.pinata.cloud/ipfs/${metaRes.IpfsHash}`;

      await mintNFT(tokenURI);
      setResetCounter((prev) => prev + 1);
    } catch (err) {
      console.error("Minting failed:", err);
    } finally {
      setMinting(false);
    }
  }

  return (
    <Container>
      <HeaderSection>
        <Header>📸 NFT-ProofAI-App</Header>
        <SubHeader>
          Capture. Classify. Summarize. Mint your proof on-chain.
        </SubHeader>
      </HeaderSection>

      {!isConnected ? (
        <>
          {connectors.map((connector) => (
            <Button key={connector.id} onClick={() => connect({ connector })}>
              Connect with {connector.name}
            </Button>
          ))}
        </>
      ) : !signed ? (
        <Button onClick={requestSignature}>Sign to Prove Ownership</Button>
      ) : (
        <>
          <StatusCard>
            <StatusHeader>🔐 Wallet Connected</StatusHeader>
            <StatusText>
              <strong>Address:</strong> <Copyable>{address}</Copyable>
            </StatusText>
            <StatusText>
              ✅ Signature verified. You're ready to upload your event.
            </StatusText>
          </StatusCard>
          <CameraInput
            onCapture={handleImageUpload}
            resetTrigger={resetCounter}
          />
          {image && <ImagePreview src={imageUrl} />}

          {labels.length > 0 && (
            <>
              <InfoText>Select a label:</InfoText>
              <ul>
                {labels.map((labelObj) => (
                  <li key={labelObj.label}>
                    <label>
                      <input
                        type="radio"
                        name="label"
                        value={labelObj.label}
                        checked={selectedLabel === labelObj.label}
                        onChange={() => {
                          setSelectedLabel(labelObj.label);
                          setSummary(
                            `This image appears to be: ${labelObj.label}`
                          );
                        }}
                      />
                      {labelObj.label} ({(labelObj.score * 100).toFixed(1)}%)
                    </label>
                  </li>
                ))}
              </ul>
            </>
          )}
          {uploading && (
            <InfoText>🌀 Uploading and classifying image...</InfoText>
          )}
          {minting && <InfoText>🌀 Minting NFT on-chain...</InfoText>}

          {summary && (
            <>
              <TextArea
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Edit AI-generated summary..."
              />
              <Button onClick={handleMint}>Mint NFT</Button>
            </>
          )}
        </>
      )}
      {confirmation && (
        <div
          style={{
            background: "#fff",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 0 15px rgba(0,0,0,0.2)",
            position: "fixed",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
          }}
        >
          <h2>✅ Mint Successful</h2>
          <p>Your data has been minted on-chain.</p>
          <p>
            <strong>Token ID:</strong> {parseInt(confirmation.tokenId, 16)}
          </p>
          <Button onClick={() => setConfirmation(null)}>Close</Button>
        </div>
      )}
      {events.length > 0 && <EventList events={events} />}
    </Container>
  );
}
