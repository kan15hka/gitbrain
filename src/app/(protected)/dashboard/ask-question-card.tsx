import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import { formatDateTime } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { toast } from "sonner";
import { askQuestion } from "./actions";
import { readStreamableValue } from "ai/rsc";
import MDEditor from "@uiw/react-md-editor";
import { Sora } from "next/font/google";
import CodeReferences from "./code-references";
import { X } from "lucide-react";
import { api } from "@/trpc/react";
import useRefetch from "@/hooks/use-reftech";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [saveAnswerLoading, setSaveAnswerLoading] = React.useState(false);
  const [fileReferences, setFilesReferences] = React.useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = React.useState("");
  const saveAnswer = api.project.saveQuestionAnswer.useMutation();
  const refetch = useRefetch();
  const onSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    try {
      e?.preventDefault();
      if (question.trim() === "") {
        toast.warning("Enter question prompt to proceed!");
        return;
      }

      if (!project?.id) {
        toast.error("Project not found!");
        return;
      }

      setLoading(true);
      setAnswer("");
      setFilesReferences([]);

      const { output, fileReferences } = await askQuestion(
        question,
        project.id,
      );
      setOpen(true);

      setFilesReferences(fileReferences);

      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          setAnswer((ans) => ans + delta);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const onSaveAnswerClick = async () => {
    try {
      setSaveAnswerLoading(true);

      saveAnswer.mutate({
        projectId: project!.id,
        question,
        answer,
        fileReferences,
      });
      refetch();

      toast.success("Gitbrain response saved sucessfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failes to save Gitbrain response!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };
  const onDialogChange = (open: boolean) => {
    if (open) {
      setQuestion("");
    }
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={() => onDialogChange(open)}>
        <DialogContent className="max-h-[90vh] max-w-[71vw] overflow-auto rounded-md">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <Image src="/logo.png" alt="Logo" width={35} height={35} />
                <div className="text-lg font-semibold"> GitBrain</div>
                {loading && (
                  <div className="ml-2 h-5 w-5 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  disabled={saveAnswer.isPending}
                  variant={"outline"}
                  onClick={onSaveAnswerClick}
                >
                  {saveAnswer.isPending && (
                    <div className="h-5 w-5 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
                  )}
                  <div>{saveAnswer.isPending ? "Saving" : "Save Response"}</div>
                </Button>
                <Button
                  className="h-full px-2"
                  onClick={() => onDialogChange(open)}
                >
                  <X />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex max-w-[65vw] flex-col justify-center gap-2">
            <div className="flex gap-2 text-clip rounded-md bg-gray-100 px-4 py-3 text-sm font-medium capitalize">
              <img src="/github-dark.svg" alt="Github" className="size-5" />
              <div>{question}</div>
            </div>
            <MDEditor.Markdown
              source={`<br>${answer}<br><br>`}
              style={{ fontSize: "14px" }}
              className={`!h-full max-h-[60vh] max-w-[65vw] overflow-auto rounded-md border px-5 text-sm ${sora.className}`}
            />

            <CodeReferences fileReferences={fileReferences} />

            <Button
              type="button"
              className="w-full"
              onClick={() => {
                onDialogChange(open);
              }}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown} // ✅ Trigger onSubmit on Enter
            />
            <div className="h-4"></div>
            <Button disabled={loading}>
              <div className="flex items-center gap-2">
                {loading && (
                  <div className="h-5 w-5 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                )}
                <div>{loading ? "Asking" : "Ask GitBrain!"}</div>
              </div>
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
