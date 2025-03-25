import { db } from "@/server/db";
import { Octokit } from "octokit";
import { env } from "process";
import axios from "axios";
import { aiSummariseCommit } from "./gemini";
export const octokit = new Octokit({ auth: env.GITHUB_TOKEN });

const repoURL = "https://github.com/kan15hka/FaqBot";

type Response = {
  commitMessage: string;
  commitHash: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const getCommitHashes = async (repoURL: string): Promise<Response[]> => {
  const [owner, repo] = repoURL.split("/").slice(-2);
  if (!owner || !repo) {
    throw new Error("Invalid Github URL");
  }
  const { data } = await octokit.rest.repos.listCommits({
    owner: owner as string,
    repo: repo as string,
  });
  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  );

  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitMessage: commit.commit.message ?? "",
    commitHash: commit.sha as string,
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitAuthorAvatar: commit?.author?.avatar_url ?? "",
    commitDate: commit.commit?.author?.date ?? "",
  }));
};

export const pollCommits = async (projectId: string) => {
  try {
    const { project, repoURL } = await fetchProjectGithubRepoURL(projectId);
    if (!repoURL) {
      return [];
    }
    const commitHashes = await getCommitHashes(repoURL);
    const unprocessedCommits = await filterUnprocessedCommitHashes(
      projectId,
      commitHashes,
    );
    const summaryResponses = await Promise.allSettled(
      unprocessedCommits.map((commit) => {
        return summariseCommit(repoURL, commit.commitHash);
      }),
    );
    const summaries = summaryResponses.map((response) => {
      if (response.status === "fulfilled") {
        return response.value as string;
      }
      return "";
    });
    const commits = await db.commit.createMany({
      data: summaries.map((summary, index) => {
        return {
          projectId: projectId,
          commitMessage: unprocessedCommits[index]!.commitMessage,
          commitHash: unprocessedCommits[index]!.commitHash,
          commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
          commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
          commitDate: unprocessedCommits[index]!.commitDate,
          summary,
        };
      }),
    });
    return commits;
  } catch (error) {
    console.error("Error polling commits:", error);
    return [];
  }
};

async function summariseCommit(repoURL: string, commitHash: string) {
  const { data } = await axios.get(`${repoURL}/commit/${commitHash}.diff`, {
    headers: { Accept: "application/vnd.github.v3.diff" },
  });
  return (await aiSummariseCommit(data)) || "";
}

async function fetchProjectGithubRepoURL(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      repoURL: true,
    },
  });

  if (!project?.repoURL) {
    console.log(
      `Skipping commit polling for project ${projectId}: No GitHub URL`,
    );
    return { project, repoURL: null };
  }
  return { project, repoURL: project.repoURL };
}

async function filterUnprocessedCommitHashes(
  projectId: string,
  commitHashes: Response[],
) {
  const processedCommits = await db.commit.findMany({
    where: { projectId },
  });

  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash,
      ),
  );
  return unprocessedCommits;
}
