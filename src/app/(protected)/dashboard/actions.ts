"use server";
import { streamText, streamObject } from "ai";
import { createStreamableValue, streamUI } from "ai/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { env } from "@/env";
import { generateSummaryEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";

const google = createGoogleGenerativeAI({ apiKey: env.GOOGLE_API_KEY });

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();

  const queryVector = await generateSummaryEmbedding(question);
  const vectorQuery = `[${queryVector.join(",")}]`;

  const result = (await db.$queryRaw`
  SELECT "fileName","sourceCode","summary",
  1-("summaryEmbedding"<=>${vectorQuery}::vector) AS similarity
  FROM "SourceCodeEmbedding"
  WHERE 1-("summaryEmbedding"<=>${vectorQuery}::vector) > .5
  AND "projectId"=${projectId}
  ORDER BY similarity DESC
  LIMIT 10
  `) as { fileName: string; sourceCode: string; summary: string }[];

  let context = "";

  for (const doc of result) {
    context += `soucre: ${doc.fileName}\n content: ${doc.sourceCode}\n summary of file: ${doc.summary}\n\n`;
  }

  (async () => {
    const textStream = await streamText({
      model: google("gemini-1.5-flash"),
      prompt: `
  You are an AI code assistant who answers questions about the codebase. Your target audience is a technical intern.
  AI assistant is a brand new, powerful, human-like artificial intelligence.
  The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
  AI is a well-behaved and well-mannered individual.
  AI is always friendly, kind, and inspiring, and eager to provide vivid and thoughtful responses to the user.
  AI has the sum of all knowledge in its brain and can accurately answer nearly any question about any topic.
  
  If the question is asking about code or a specific file, AI will provide a detailed answer, giving step-by-step instructions.
  
  START CONTEXT BLOCK
  ${context}
  END OF CONTEXT BLOCK
  
  START QUESTION
  ${question}
  END OF QUESTION
  
  AI assistant will take into account any CONTEXT BLOCK that is provided in the conversation.
  If the context does not provide the answer to the question, the AI assistant will say, "I'm sorry, but I don't know the answer."
  AI assistant will not apologize for previous responses but will indicate that new information was gained.
  AI assistant will not invent anything that is not drawn directly from the context.
  Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering.
  `,
    });
    for await (const delta of textStream.textStream) {
      stream.update(delta);
    }
    stream.done();
  })();

  return {
    output: stream.value,
    filesReferences: result,
  };
}
