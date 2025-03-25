"use client";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import {
  Bot,
  CreditCard,
  LayoutDashboard,
  Plus,
  Presentation,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Q&A", url: "/qa", icon: Bot },
  { title: "Meetings", url: "/meetings", icon: Presentation },
  { title: "Billing", url: "/billing", icon: CreditCard },
];

const AppSideBar = () => {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { projects, projectId, setProjectId, isProjectPending, hasProjects } =
    useProject();
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="logo" width={40} height={40} />
          {open && <h1 className="text-xl font-bold text-black">GitBrain</h1>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={cn(
                          { "!bg-primary !text-white": pathname === item.url },
                          "list-none",
                        )}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {open && (
          <SidebarGroup>
            <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isProjectPending ? (
                  <SidebarMenuItem>
                    <div className="flex items-center gap-2 px-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
                      <div>Fetching</div>
                    </div>
                  </SidebarMenuItem>
                ) : !hasProjects ? (
                  <SidebarMenuItem>
                    <div className="px-3 text-xs text-muted-foreground">
                      No projects yet. Create your first project to get started.
                    </div>
                  </SidebarMenuItem>
                ) : (
                  projects?.map((project: { id: string; name: string }) => {
                    return (
                      <SidebarMenuItem key={project.name}>
                        <SidebarMenuButton asChild>
                          <div
                            onClick={() => {
                              setProjectId(project.id);
                            }}
                          >
                            <div
                              className={cn(
                                {
                                  "!bg-primary !text-white":
                                    project.id === projectId,
                                },
                                "flex size-6 items-center justify-center rounded-sm border bg-white text-sm text-primary",
                              )}
                            >
                              {`${project.name[0]?.toUpperCase()}`}
                            </div>
                            <span>{project.name}</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })
                )}
                <div className="h-2"></div>
                <SidebarMenuItem>
                  <Link href="/create">
                    <Button size="sm" variant={"outline"} className="w-fit">
                      <Plus />
                      Create Project
                    </Button>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSideBar;
