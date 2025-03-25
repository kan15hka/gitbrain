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
  const [filesReferences, setFilesReferences] = React.useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = React.useState("");

  const onSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    try {
      e?.preventDefault();
      if (question.trim() === "") {
        toast("Enter question prompt to proceed!", {
          description: formatDateTime(),
          action: { label: "Close", onClick: () => console.log("Undo") },
        });
        return;
      }

      if (!project?.id) {
        toast("Project not found!", {
          description: formatDateTime(),
          action: { label: "Close", onClick: () => console.log("Undo") },
        });
        return;
      }

      setLoading(true);
      setAnswer("");
      setFilesReferences([]);

      const { output, filesReferences } = await askQuestion(
        question,
        project.id,
      );
      setOpen(true);

      setFilesReferences(filesReferences);

      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          setAnswer((ans) => ans + delta);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setQuestion("");
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

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-auto rounded-lg p-6 sm:max-w-[70vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image src="/logo.png" alt="Logo" width={40} height={40} />
              GitBrain Response
            </DialogTitle>
          </DialogHeader>
          <MDEditor.Markdown
            source={`<br>${answer}<br><br>`}
            className={`!h-full max-h-[40vh] max-w-[70vw] overflow-auto rounded-md border px-5 text-lg ${sora.className}`}
          />
          <div className="mt-4">
            <CodeReferences fileReferences={filesReferences} />
          </div>
          <Button type="button" onClick={() => setOpen(false)}>
            Close
          </Button>
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
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
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
