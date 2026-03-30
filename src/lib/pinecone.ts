import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import md5 from "md5";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";
import type { Index } from "@pinecone-database/pinecone";


let pinecone: Pinecone | null = null;

export const getPineconeClient = (): Pinecone => {
  if (!pinecone) {
    pinecone = new Pinecone();
  }
  return pinecone;
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  // 1. obtain the pdf -> downlaod and read from pdf
  console.log("downloading s3 into file system");
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("could not download from s3");
  }
  console.log("loading pdf into memory" + file_name);
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // 2. split and segment the pdf
  const documents = await Promise.all(pages.map(prepareDocument));

  // 3. vectorise and embed individual documents
  const vectors: PineconeRecord[] = await Promise.all(
  documents.flat().map(embedDocument)
);

  // 4. upload to pinecone
  const client = await getPineconeClient();
  const pineconeIndex: Index = await client.index("chatpdf-ollama");
  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

  console.log("Pages count:", pages.length);
  console.log("Documents count:", documents.flat().length);
  console.log("Vectors count:", vectors.length);



  console.log("inserting vectors into pinecone");
  await namespace.upsert({
  records: vectors,
});




  return documents[0];
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let text = page.pageContent
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return [];
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  return splitter.splitDocuments([
    new Document({
      pageContent: text,
      metadata: {
        pageNumber: page.metadata.loc.pageNumber,
        text: truncateStringByBytes(text, 36000),
      },
    }),
  ]);
}
