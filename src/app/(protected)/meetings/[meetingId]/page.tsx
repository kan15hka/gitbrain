import React from "react";
import IssuesList from "./issues-list";
type Props = {
  params: Promise<{ meetingId: string }>;
};
const MeetingDetails = async ({ params }: Props) => {
  const { meetingId } = await params;
  return (
    <div>
      <IssuesList meetingId={meetingId} />
    </div>
  );
};

export default MeetingDetails;
