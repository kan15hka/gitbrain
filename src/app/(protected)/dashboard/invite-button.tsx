"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useProject from "@/hooks/use-project";
import { Copy, Users } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const InviteButton = () => {
  const { projectId } = useProject();
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full">
          <DialogTitle className="hidden"></DialogTitle>
          <div className="flex flex-col items-start">
            <div className="flex items-center justify-between font-semibold">
              <div className="flex items-center gap-2">
                <span className="inline-flex rounded-full bg-black p-2 text-white">
                  <Users className="h-4 w-4" />
                </span>
                <div>Invite Team Members</div>
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
              Please copy and paste the link to invite others to collaborate on
              this project.{" "}
            </div>
            <div className="relative mt-2 flex w-full">
              <Input
                className="pr-10" // ✅ Adds space for the icon
                readOnly
                value={`${window.location.origin}/join/${projectId}`}
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/join/${projectId}`,
                  );
                  toast.success("Copied to Clipboard");
                }}
                className="absolute right-0 px-3"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <Button className="mt-4 w-full" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Invite Members
      </Button>
    </>
  );
};

export default InviteButton;
