"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, RouterOutputs } from "@/trpc/react";
import { VideoIcon, X } from "lucide-react";
import React from "react";

type Props = {
  meetingId: string;
};

const IssuesList = ({ meetingId }: Props) => {
  const { data: meeting, isLoading } = api.project.getMeetingById.useQuery(
    { meetingId },
    { refetchInterval: 4000 },
  );
  if (isLoading || !meeting) {
    return (
      <div className="mt-2 flex items-center gap-2">
        <div className="h-5 w-5 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
        <div className="text-sm">Fetching Meeting Details...</div>
      </div>
    );
  }
  return (
    <>
      <div className="p-2">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-4 border-b pb-2 lg:mx-0 lg:max-w-none">
          <div className="flex items-center gap-x-4">
            <div className="rounded-full border bg-white p-3">
              <VideoIcon className="h-5 w-5" />
            </div>
            <h1>
              <div className="text-sm text-gray-600">
                {`Meeting on ${meeting.createdAt.toLocaleString()}`}
              </div>
              <div className="text-base font-semibold text-gray-900">
                {meeting.name}
              </div>
            </h1>
          </div>
        </div>
        <div className="h-4"></div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {meeting.issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </div>
    </>
  );
};

function IssueCard({
  issue,
}: {
  issue: NonNullable<
    RouterOutputs["project"]["getMeetingById"]
  >["issues"][number];
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="relative flex items-center">
              <div>{issue.gist}</div>
              <Button
                onClick={() => setOpen(false)}
                variant="outline"
                className="absolute right-0 rounded-md px-[10px]"
              >
                <X className="size-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              {`${issue.createdAt.toDateString()} ${issue.createdAt.toLocaleTimeString()}`}
            </DialogDescription>
            <p className="TEXT-SM text-gray-600">{issue.headline}</p>
            <blockquote className="mt-2 border-l-4 border-gray-300 bg-gray-50 p-4">
              <span className="text-sm text-gray-600">
                {issue.start} - {issue.end}
              </span>
              <p className="font-medium italic leading-relaxed text-gray-900">
                {`"${issue.summary}"`}
              </p>
            </blockquote>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Card className="relative">
        <CardHeader>
          <CardTitle className="">{issue.gist}</CardTitle>
          <div className="border-b"></div>
          <div className="text-sm">{issue.headline}</div>{" "}
          <div className="h-1"></div>
          <Button onClick={() => setOpen(true)} className="w-fit">
            Details
          </Button>
        </CardHeader>
      </Card>
    </>
  );
}
export default IssuesList;
