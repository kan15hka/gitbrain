"use client";
import useProject from "@/hooks/use-project";
import { useUser } from "@clerk/nextjs";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import React from "react";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";
import MeetingCard from "./meeting-card";
import DeleteProjectButton from "./delete-button";
import InviteButton from "./invite-button";
import TeamMembers from "./team-members";

const DashboardPage = () => {
  const { project, isProjectPending, hasProjects } = useProject();
  return (
    <div>
      {isProjectPending ? (
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
          <div>Fetching Project</div>
        </div>
      ) : !hasProjects ? (
        <div className="mt-10 flex w-full flex-col items-center justify-center">
          <img
            src="/developer_vector.png"
            alt="Developer Vector"
            className="w-[300px]"
          />
          <div className="font-medium text-black">
            Ooops! No projects found.
          </div>
          <div className="text-sm">Start by creating your first project!</div>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-y-4">
            {/* Github Link Card */}
            <div className="w-fit rounded-md bg-primary px-4 py-3">
              <div className="flex items-center">
                <img
                  src="/github.svg"
                  alt="Github"
                  className="size-5 text-white"
                />
                <div className="ml-2">
                  <p className="text-sm font-medium text-white">
                    This project is linked to{" "}
                    <Link
                      href={project?.repoURL ?? ""}
                      className="inline-flex items-center text-white/80 hover:underline"
                    >
                      {project?.repoURL}
                      <ExternalLink className="ml-1 size-4" />
                    </Link>
                  </p>
                </div>
              </div>
            </div>
            <div className="h-4"></div>
            <div className="flex items-center gap-4">
              <TeamMembers />
              <InviteButton />
              <DeleteProjectButton />
            </div>
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
              <AskQuestionCard />
              <MeetingCard />
            </div>
          </div>
          <div className="mt-8"></div>
          <CommitLog />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
