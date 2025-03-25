import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";

const CommitLog = () => {
  const { projectId, project } = useProject();
  if (!projectId) return <p> No commits found.</p>;

  const queryResult = api.project.getCommits.useQuery({ projectId });
  const commits = queryResult?.data ?? [];
  if (queryResult.isPending)
    return (
      <div className="flex items-center gap-2 px-3">
        <div className="h-5 w-5 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
        <div>Fetching Commits</div>
      </div>
    );
  return (
    <>
      <ul className="space-y-6">
        {commits?.map(
          (
            commit: {
              id: string;
              commitAuthorAvatar?: string;
              commitAuthorName: string;
              commitHash: string;
              commitMessage: string;
              summary: string;
            },
            commitIdx: number,
          ) => {
            return (
              <li key={commit.id} className="relative flex gap-x-4">
                <div
                  className={cn(
                    commitIdx === commits.length - 1 ? "h-6" : "-bottom-6",
                    "absolute left-0 top-0 flex w-6 justify-center",
                  )}
                >
                  <div className="w-px translate-x-1 bg-gray-200"></div>
                </div>
                <>
                  <img
                    src={commit?.commitAuthorAvatar || "/github.png"}
                    alt="Commit Avatar"
                    onError={(e) => (e.currentTarget.src = "/github.png")}
                    className="relative mt-4 size-8 flex-none rounded-full bg-gray-50"
                  />
                  <div className="flex-auto rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200">
                    <div className="flex justify-between gap-x-4">
                      <Link
                        target="_blank"
                        href={`${project?.repoURL}/commit/${commit.commitHash}`}
                        className="flex items-center gap-1 py-0.5 text-xs leading-5 text-gray-500"
                      >
                        <span className="font-medium text-gray-900">
                          {commit.commitAuthorName}
                        </span>
                        <span className="inline-flex items-center">
                          commited
                          <ExternalLink className="ml-1 size-4" />
                        </span>
                      </Link>
                    </div>
                    <span className="font-semibold">
                      {commit.commitMessage}
                    </span>
                    <pre className="whitespace-pre-wrap text-sm leading-6 text-gray-500">
                      {commit.summary}
                    </pre>
                  </div>
                </>
              </li>
            );
          },
        )}
      </ul>
    </>
  );
};

export default CommitLog;
