import { CohereEmbeddings } from "@langchain/cohere";
const embeddings = new CohereEmbeddings({
apiKey: process.env.COHERE_API_KEY!,
model: "embed-english-light-v3.0", // free, 384 dims
});

// main function used by your app
export async function getEmbeddings(text: string): Promise<number[]> {
  try {
    // clean pdf text (important — prevents token overflow)
    const cleanedText = text
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);

    // generate vector embedding locally (FREE)
    const vector = await embeddings.embedQuery(cleanedText);

    return vector;
  } catch (error) {
    console.error("Embedding error:", error);
    throw new Error("Failed to create embeddings");
  }
}