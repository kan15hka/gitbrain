"use client";
import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import { useEffect } from "react";

const useProject = () => {
  const { data: projects = [], isPending: isProjectPending } =
    api.project.getProjects.useQuery();
  const [projectId, setProjectId] = useLocalStorage("gitbrain-projectId", "");

  const project = projects?.find(
    (project: { id: string; name: string }) => project.id === projectId,
  );

  useEffect(() => {
    if (!isProjectPending && projects.length > 0) {
      // ✅ Combined logic into a single condition
      if (!projectId || !project) {
        setProjectId(projects[0]?.id || "");
      }
    }
  }, [projects, projectId, isProjectPending, setProjectId]);

  return {
    projects,
    project,
    projectId,
    setProjectId,
    isProjectPending,
    hasProjects: projects.length > 0,
  };
};

export default useProject;
