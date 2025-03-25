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

  // Clear projectId from localStorage if projects are loaded but the stored ID doesn't exist
  useEffect(() => {
    if (!isProjectPending && projects.length > 0 && projectId && !project) {
      setProjectId("");
    }

    // If there's no projectId but projects exist, set the first one as active
    if (!isProjectPending && projects.length > 0 && !projectId) {
      setProjectId(projects[0]?.id || "");
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
