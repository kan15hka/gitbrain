"use client";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
  fileReferences: {
    fileName: string;
    sourceCode: string;
    summary: string;
  }[];
};

const CodeReferences = ({ fileReferences }: Props) => {
  const [tab, setTab] = React.useState(fileReferences[0]?.fileName);

  if (fileReferences.length === 0) return null;

  return (
    <div className="max-w-[70vw]">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex gap-2 overflow-x-auto rounded-md bg-gray-200 p-1">
          {fileReferences.map((file) => (
            <button
              onClick={() => setTab(file.fileName)}
              key={file.fileName}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted",
                { "bg-primary text-primary-foreground": tab === file.fileName },
              )}
            >
              {file.fileName}
            </button>
          ))}
        </div>

        {fileReferences.map((file) => (
          <TabsContent
            key={file.fileName}
            value={file.fileName}
            className="max-h-[50vh] overflow-y-auto rounded-md bg-black p-3"
          >
            <SyntaxHighlighter
              language="typescript" // ✅ Specify language for correct formatting
              style={lucario}
              customStyle={{
                maxHeight: "45vh",
                overflow: "auto",
                whiteSpace: "pre-wrap", // ✅ Preserve line breaks
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              {file.sourceCode}
            </SyntaxHighlighter>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CodeReferences;
