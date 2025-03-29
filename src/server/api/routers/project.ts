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

  uploadMeeting: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        meetingUrl: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const meeting = await ctx.db.meeting.create({
        data: {
          projectId: input.projectId,
          meetingUrl: input.meetingUrl,
          name: input.name,
          status: "PROCESSING",
        },
      });

      return meeting;
    }),
  getMeetings: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const meetings = ctx.db.meeting.findMany({
          where: {
            projectId: input.projectId,
          },
          include: { issues: true },
        });

        return meetings;
      } catch (error) {
        console.error("Error fetching meetings:", error);
        return [];
      }
    }),
  getMeetingById: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const meeting = ctx.db.meeting.findUnique({
          where: {
            id: input.meetingId,
          },
          include: { issues: true },
        });

        return meeting;
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    }),
  deleteMeeting: protectedProcedure
    .input(
      z.object({
        meetingId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.$transaction([
          ctx.db.issue.deleteMany({
            where: {
              meetingId: input.meetingId,
            },
          }),
          ctx.db.meeting.delete({
            where: {
              id: input.meetingId,
            },
          }),
        ]);
      } catch (error) {
        console.error("Error deleting meeting:", error);
      }
    }),
  deleteProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const meetings = await ctx.db.meeting.findMany({
          where: { projectId: input.projectId },
        });

        await ctx.db.$transaction([
          ...(meetings.length > 0
            ? [
                ctx.db.issue.deleteMany({
                  where: {
                    OR: meetings.map((meeting) => ({
                      meetingId: meeting.id,
                    })),
                  },
                }),
                ctx.db.meeting.deleteMany({
                  where: {
                    OR: meetings.map((meeting) => ({
                      id: meeting.id,
                    })),
                  },
                }),
              ]
            : []), // Skip meeting-related deletes if no meetings exist

          // Combine all project-related deletions into a single batch
          ctx.db.sourceCodeEmbedding.deleteMany({
            where: { projectId: input.projectId },
          }),
          ctx.db.commit.deleteMany({
            where: { projectId: input.projectId },
          }),
          ctx.db.questionAnswer.deleteMany({
            where: { projectId: input.projectId },
          }),
          ctx.db.userToProjects.deleteMany({
            where: { projectId: input.projectId },
          }),

          // Finally, delete the project itself
          ctx.db.project.delete({
            where: { id: input.projectId },
          }),
        ]);
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }),

  getTeamMembers: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const projects = await ctx.db.userToProjects.findMany({
          where: {
            projectId: input.projectId,
          },
          include: { user: true },
        });

        return projects ?? [];
      } catch (error) {
        console.error("Error fetching projects:", error);
        return [];
      }
    }),
});
