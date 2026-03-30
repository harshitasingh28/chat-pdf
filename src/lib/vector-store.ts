import { PDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "@langchain/community/vectorstores/memory";
import { OllamaEmbeddings } from "@langchain/ollama";

export async function loadPDFIntoMemory(pdfUrl: string) {
  // 1️⃣ fetch pdf from S3
  const response = await fetch(pdfUrl);
  const blob = await response.blob();

  // 2️⃣ load pdf
  const loader = new PDFLoader(blob);
  const docs = await loader.load();

  // 3️⃣ split into chunks (MOST IMPORTANT STEP)
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await splitter.splitDocuments(docs);

  // 4️⃣ local embeddings (FREE)
  const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: "http://127.0.0.1:11434",
  });

  // 5️⃣ create vector DB in RAM
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );

  return vectorStore;
}