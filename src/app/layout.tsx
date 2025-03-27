import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { TRPCReactProvider } from "@/trpc/react";
import { Sora } from "next/font/google";
import { Toaster } from "sonner";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GitBrain",
  description: "Optimize, Improve, Innovate with GitBrain",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={sora.className}>
        <body>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster richColors position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
