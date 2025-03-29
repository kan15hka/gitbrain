"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useProject from "@/hooks/use-project";
import { uploadFile } from "@/lib/firebase";
import { api } from "@/trpc/react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { on } from "events";
import { Presentation, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
const MeetingCard = () => {
  const { projectId, project } = useProject();
  const processMeeting = useMutation({
    mutationFn: async (data: {
      meetingUrl: string;
      projectId: string;
      meetingId: string;
    }) => {
      const { meetingUrl, projectId, meetingId } = data;
      const response = await axios.post("/api/process-meeting", {
        meetingUrl,
        meetingId,
        projectId,
      });
      return response.data;
    },
  });
  const router = useRouter();
  const uploadMeeting = api.project.uploadMeeting.useMutation();
  const [progress, setProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    multiple: false,
    maxSize: 50_000_000,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      const downloadUrl = (await uploadFile(
        file as File,
        setProgress,
      )) as string;
      if (!file) return;
      uploadMeeting.mutate(
        {
          projectId: projectId,
          meetingUrl: downloadUrl,
          name: file.name,
        },
        {
          onSuccess: (meeting) => {
            toast.success("Meeting uploaded successfully.");
            router.push("/meetings");
            processMeeting.mutateAsync({
              meetingUrl: downloadUrl,
              meetingId: meeting.id,
              projectId: project!.id,
            });
          },
          onError: () => {
            toast.error("Failed to upload meeting.");
          },
        },
      );
      setIsUploading(false);
    },
  });
  return (
    <Card className="col-span-2 flex flex-col items-center justify-center p-8">
      {isUploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex items-center justify-center">
            {/* Spinner */}
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
            {/* Centered Percentage */}
            <div className="absolute text-xs font-semibold text-black">{`${progress}%`}</div>
          </div>
          <div className="text-sm">Uploading your meeting...</div>{" "}
        </div>
      ) : (
        <>
          <Presentation className="h-10 w-10" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Create a new meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyse your meeting with Gitbrain <br />
            Powered by AI.
          </p>
          <div className="mt-4">
            <Button disabled={isUploading} {...getRootProps()}>
              <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Upload Meeting
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default MeetingCard;
