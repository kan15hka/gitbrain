import { SidebarProvider } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import React from "react";
import AppSideBar from "./app-sidebar";

type Props = {
  children: React.ReactNode;
};
const SideBarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <AppSideBar />
      <main className="flex h-screen w-full flex-col p-2">
        <div className="flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar p-2 px-4 shadow">
          {/* <SearchBar/> */}
          <div className="ml-auto"></div>

          <div className="h-7 w-7 rounded-full">
            <UserButton />
          </div>
        </div>
        <div className="h-4"></div>
        <div className="flex-1 overflow-y-scroll rounded-md border border-sidebar-border bg-sidebar p-4 shadow">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SideBarLayout;
