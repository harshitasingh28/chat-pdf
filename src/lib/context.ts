import { getEmbeddings } from "./embeddings";
import { getPineconeClient } from "./pinecone";
import { convertToAscii } from "./utils";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {

  const pinecone = await getPineconeClient();

  const index = pinecone.Index("chatpdf-ollama");

  try {

    const namespace = convertToAscii(fileKey);

    const queryResult = await index.query({
      vector: embeddings,
      topK: 5,
      includeMetadata: true,
      namespace
    });

    return queryResult.matches || [];

  } catch (error) {

    console.log("error querying embeddings", error);
    throw error;

  }
}

export async function getContext(
  query: string,
  fileKey: string
) {

  const queryEmbeddings = await getEmbeddings(query);

  const matches = await getMatchesFromEmbeddings(
    queryEmbeddings,
    fileKey
  );
  console.log("FileKey:", fileKey);
console.log("Namespace:", convertToAscii(fileKey));
console.log("Matches:", matches);


  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.3
  );

  type Metadata = {
    text: string;
    pageNumber: number;
  };

  const docs = qualifyingDocs.map(
    (match) => (match.metadata as Metadata)?.text || ""
    );

  return docs.join("\n").substring(0, 3000);
}