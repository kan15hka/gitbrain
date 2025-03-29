"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { use } from "react";
import { joinProject } from "./join-project";
import useRefetch from "@/hooks/use-reftech";

export default function JoinPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const router = useRouter();
  const refetch = useRefetch();
  const [isJoining, setIsJoining] = useState(true);

  // Unwrap the params promise using React.use()
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;

  useEffect(() => {
    async function handleJoin() {
      if (!isJoining) return;

      const result = await joinProject(projectId);

      if (result.success) {
        toast.success("Joined project successfully");
      } else {
        if (result.error === "AlreadyJoined") {
          toast.info("You are already a member of this project");
        } else {
          toast.error(`Failed to join project: ${result.error}`);
        }
      }
      refetch();
      router.push(result.redirectTo);
    }

    handleJoin();
  }, [projectId, router, isJoining]);

  if (isJoining)
    return (
      <div className="flex items-center gap-2 px-3">
        <div className="h-5 w-5 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
        <div>{`Joining Project...`}</div>
      </div>
    );
  return null;
}
