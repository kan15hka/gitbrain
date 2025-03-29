"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-reftech";
import { api } from "@/trpc/react";
import { Trash2, X } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const DeleteProjectButton = () => {
  const { projectId, project } = useProject();
  const deleteProject = api.project.deleteProject.useMutation();
  const refetch = useRefetch();
  const [open, setOpen] = React.useState(false);

  const handleDelete = () => {
    deleteProject.mutate(
      { projectId },
      {
        onSuccess: async () => {
          toast.warning("Project deleted successfully!");
          await refetch(); // ✅ Only refetch after successful deletion
        },
        onError: () => {
          toast.warning("Failed to delete project!");
          console.error("Failed to delete project.");
        },
        onSettled: () => {
          setOpen(false);
        },
      },
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-w-[25vw]">
          <div className="flex flex-col items-start">
            <div className="flex items-center justify-between font-semibold">
              <div className="flex items-center gap-2">
                <span className="inline-flex rounded-full bg-black p-2 text-white">
                  <Trash2 className="h-4 w-4" />
                </span>
                <div>Delete Project</div>
              </div>
              {/* <Button
                onClick={() => setOpen(false)}
                variant="outline"
                className="rounded-md px-[10px]"
              >
                <X className="size-4" />
              </Button> */}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Do you really want to delete this project{" "}
              <strong className="font-semibold">{project?.name}</strong>?
            </div>
            <div className="mt-3 flex w-full items-center justify-stretch gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={deleteProject.isPending}
                className="flex-1"
                onClick={handleDelete}
              >
                {deleteProject.isPending && (
                  <div className="h-5 w-5 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                )}
                <div>{deleteProject.isPending ? "Deleting..." : "Delete"}</div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        Delete
      </Button>
    </>
  );
};

export default DeleteProjectButton;
