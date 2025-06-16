export async function classifyImage(imageUrl) {
  const response = await fetch("https://api-inference.huggingface.co/models/google/vit-base-patch16-224", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: imageUrl }),
  });

  if (!response.ok) {
    throw new Error("Failed to classify image");
  }

  return await response.json();
}