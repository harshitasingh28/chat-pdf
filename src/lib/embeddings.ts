import { OllamaEmbeddings } from "@langchain/ollama";

// connect to local Ollama server
const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://127.0.0.1:11434",
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