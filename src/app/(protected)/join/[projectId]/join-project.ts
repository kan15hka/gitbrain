// app/actions/join-project.ts
"use server";

import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function joinProject(projectId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized", redirectTo: "/sign-in" };
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return {
        success: false,
        error: "Project not found",
        redirectTo: "/dashboard",
      };
    }

    const existingMembership = await db.userToProjects.findFirst({
      where: { userId, projectId },
    });

    if (existingMembership) {
      return {
        success: false,
        error: "AlreadyJoined",
        redirectTo: "/dashboard",
      };
    }

    const dbUser = await db.user.findUnique({ where: { id: userId } });
    const client = await clerkClient();

    if (!dbUser) {
      const user = await client.users.getUser(userId);
      if (!user) {
        return { success: false, error: "UserNotFound", redirectTo: "/error" };
      }

      await db.user.create({
        data: {
          id: userId,
          emailAddress: user.emailAddresses[0]!.emailAddress,
          imageUrl: user.imageUrl,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    }

    await db.userToProjects.create({
      data: {
        userId,
        projectId,
      },
    });

    // Revalidate dashboard page to show updated projects
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "joined-project",
      redirectTo: "/dashboard",
    };
  } catch (error) {
    console.error("Error joining project:", error);
    return {
      success: false,
      error: "failed-to-join",
      redirectTo: "/dashboard",
    };
  }
}
