import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        repoURL: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const project = await ctx.db.project.create({
          data: {
            repoURL: input.repoURL,
            name: input.name,
            userToProjects: {
              create: {
                userId: ctx.user.userId!,
              },
            },
          },
        });
        await pollCommits(project.id);
        await indexGithubRepo(project.id, input.repoURL, input.githubToken);

        return project;
      } catch (error) {
        console.error("Error creating project:", error);
        throw new Error("Failed to create project");
      }
    }),
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    try {
      const projects = await ctx.db.project.findMany({
        where: {
          userToProjects: {
            some: { userId: ctx.user.userId! },
          },
          deletedAt: null,
        },
      });

      return projects ?? []; // Ensure it never returns undefined
    } catch (error) {
      console.error("Error fetching projects:", error);
      return []; // Fallback to empty array on error
    }
  }),

  getCommits: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!input.projectId) {
        return [];
      }
      pollCommits(input.projectId).catch((err) => {
        console.error(
          `Error polling commits for project ${input.projectId}:`,
          err,
        );
      });
      return await ctx.db.commit.findMany({
        where: {
          projectId: input.projectId,
        },
      });
    }),
  saveQuestionAnswer: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        fileReferences: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.projectId) {
        return [];
      }
      pollCommits(input.projectId).catch((err) => {
        console.error(
          `Error polling commits for project ${input.projectId}:`,
          err,
        );
      });
      return await ctx.db.questionAnswer.create({
        data: {
          projectId: input.projectId,
          userId: ctx.user.userId!,
          fileReferences: input.fileReferences,
          question: input.question,
          answer: input.answer,
        },
      });
    }),
  getQuestionAnswers: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!input.projectId) {
        return [];
      }
      return await ctx.db.questionAnswer.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
});
