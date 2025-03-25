import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { generateSummaryEmbedding, summariseCode } from "./gemini";
import { db } from "@/server/db";

export const loadGithubRepo = async (repoURL: string, githubToken?: string) => {
  const loader = new GithubRepoLoader(repoURL, {
    accessToken: githubToken || "",
    branch: "main",
    ignoreFiles: [
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "bun.lockb",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });

  const docs = await loader.load();
  return docs;
};

export const indexGithubRepo = async (
  projectId: string,
  repoURL: string,
  githubToken?: string,
) => {
  const docs = await loadGithubRepo(repoURL, githubToken);
  console.log(docs.length);
  const allEmbeddings = await generateEmbeddings(docs);
  console.log(allEmbeddings.length);

  await Promise.allSettled(
    allEmbeddings.map(async (embedding) => {
      if (!embedding || !Array.isArray(embedding.embedding)) {
        console.log("No");
        return;
      }

      const vector = `[${embedding.embedding.join(",")}]`; // Format as PostgreSQL vector

      try {
        const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
          data: {
            summary: embedding.summary,
            sourceCode: embedding.sourceCode,
            fileName: embedding.fileName,
            projectId,
          },
        });

        if (vector !== "[]") {
          // Only update if vector is valid
          await db.$executeRaw`
            UPDATE "SourceCodeEmbedding"
            SET "summaryEmbedding" = ${vector}::vector
            WHERE "id" = ${sourceCodeEmbedding.id}
          `;
        }
      } catch (error) {
        console.error("Failed to insert embedding:", error);
      }
    }),
  );
};
const cleanString = (str: string) => {
  return str.replace(/\u0000/g, ""); // Remove null bytes
};

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(
    docs.map(async (doc) => {
      const summary = await summariseCode(doc);
      const embedding = await generateSummaryEmbedding(summary);
      console.log(embedding);

      return {
        summary,
        embedding,
        sourceCode: cleanString(JSON.stringify(doc.pageContent)),
        fileName: cleanString(doc.metadata.source),
      };
    }),
  );
};
