"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";
import AskQuestionCard from "../dashboard/ask-question-card";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "../dashboard/code-references";
import { Sora } from "next/font/google";
import { Bot, Calendar, FileQuestion } from "lucide-react";
import Image from "next/image";
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});
const QAPage = () => {
  const { projectId } = useProject();
  const { data: questionAnswers, isPending: isQuestionAnswersFetching } =
    api.project.getQuestionAnswers.useQuery({
      projectId,
    });

  const [questionIndex, setQuestionIndex] = React.useState(0);
  const question = questionAnswers?.[questionIndex];
  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <div className="font-semibold">Saved Questions</div>
      <div className="h-2"></div>
      {isQuestionAnswersFetching ? (
        <div className="flex items-center gap-2 px-3">
          <div className="h-5 w-5 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
          <div>Fetching Saved Question and Answers</div>
        </div>
      ) : questionAnswers?.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No saved responses. Generate and save responses to get started.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {questionAnswers?.map((questionAnswer, index) => {
            return (
              <React.Fragment key={questionAnswer.id}>
                <SheetTrigger onClick={() => setQuestionIndex(index)}>
                  <div className="rounded-md border bg-white p-3 shadow">
                    {/* <img
                    src={"/github-dark.svg"}
                    alt="Commit Avatar"
                    className="size-12 flex-none rounded-sm"
                  /> */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <img
                          src={questionAnswer.user.imageUrl ?? ""}
                          alt={`User Avatar ${index}`}
                          className="size-9 rounded-full"
                        />
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-1">
                            <FileQuestion className="size-5 text-gray-700" />
                            <p className="line-clamp-1 font-medium capitalize text-gray-700">
                              {questionAnswer.question}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="whitespace-nowrap text-xs text-gray-400">
                              {questionAnswer?.createdAt.toDateString()}
                            </span>
                            <span className="whitespace-nowrap text-xs text-gray-400">
                              {questionAnswer?.createdAt.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Bot className="min-w-5 flex-1 text-gray-700" />
                        <p className="line-clamp-1 text-sm text-gray-500">
                          {questionAnswer?.answer.trim()}
                        </p>
                      </div>
                    </div>
                  </div>
                </SheetTrigger>
              </React.Fragment>
            );
          })}
        </div>
      )}
      {question && (
        <SheetContent className="overflow-y-auto sm:max-w-[80vw]">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <Image src="/logo.png" alt="Logo" width={35} height={35} />
              <div className="text-lg font-semibold">GitBrain Response</div>
            </div>
            <div className="my-2 flex items-center gap-1">
              <FileQuestion className="size-5 text-gray-700" />
              <div className="line-clamp-1 text-sm font-medium capitalize">
                {question.question}
              </div>
            </div>
          </div>
          <MDEditor.Markdown
            source={`<br>${question.answer}<br><br>`}
            style={{ fontSize: "14px" }}
            className={`h-fit max-h-[60vh] overflow-auto rounded-md border px-5 text-sm ${sora.className}`}
          />
          <div className="h-2"></div>
          <CodeReferences
            fileReferences={(question.fileReferences ?? []) as any}
          />
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QAPage;
