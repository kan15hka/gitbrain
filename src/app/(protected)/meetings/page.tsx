"use client";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";
import MeetingCard from "../dashboard/meeting-card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useRefetch from "@/hooks/use-reftech";

const MeetingsPage = () => {
  const { projectId } = useProject();
  const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
    { projectId: projectId },
    { refetchInterval: 4000 },
  );
  const deleteMeeting = api.project.deleteMeeting.useMutation();
  const refetch = useRefetch();
  return (
    <>
      <MeetingCard />
      <div className="h-6"></div>
      <div className="font-semibold">Meetings</div>
      {isLoading ? (
        <div className="mt-2 flex items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
          <div className="text-sm">Fetching Meetings...</div>
        </div>
      ) : meetings && meetings.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No meetings yet. Upload one to get started!
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {meetings?.map((meeting) => (
            <li
              key={meeting.id}
              className="flex items-center justify-between gap-x-6 py-5"
            >
              <div>
                <div className="min-w-0"></div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/meetings/${meeting.id}`}
                    className="text-sm font-semibold"
                  >
                    {meeting.name}
                  </Link>
                  {meeting.status === "PROCESSING" && (
                    <Badge className="bg-yellow-500 text-white">
                      Processing
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-x-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <p className="whitespace-nowrap">
                      {meeting.createdAt.toDateString()}
                    </p>
                    <p className="whitespace-nowrap">
                      {meeting.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                </div>{" "}
                <p className="truncate text-sm font-medium capitalize">
                  {meeting.issues.length} issues
                </p>
              </div>
              <div className="flex flex-none items-center gap-3">
                <Link href={`/meetings/${meeting.id}`}>
                  <Button variant={"outline"}>View Meeting</Button>
                </Link>
                <Button
                  // variant="destructive"
                  disabled={deleteMeeting.isPending}
                  onClick={() => {
                    deleteMeeting.mutate({ meetingId: meeting.id });
                    refetch();
                  }}
                >
                  {deleteMeeting.isPending && (
                    <div className="h-5 w-5 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                  )}
                  <div>
                    {deleteMeeting.isPending ? "Deleting..." : "Delete"}
                  </div>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default MeetingsPage;
