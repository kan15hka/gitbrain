"use client";
import { useSearchParams, useRouter } from "next/navigation";
import React from "react";

const ErrorPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorMessage = searchParams.get("message") || "Something went wrong.";

  return (
    <div>
      <div className="flex h-screen flex-col items-center justify-center">
        <img
          src="/developer_vector.png"
          alt="Developer Vector"
          className="w-[300px]"
        />
        <div className="font-medium text-black">
          Ooops! Something went wrong.
        </div>
        <div className="text-sm">{errorMessage}</div>
      </div>
    </div>
  );
};

export default ErrorPage;
