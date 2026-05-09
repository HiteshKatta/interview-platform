// import { mutation, query } from "./_generated/server";
// import { v } from "convex/values";

// // add a new comment
// export const addComment = mutation({
//   args: {
//     interviewId: v.id("interviews"),
//     content: v.string(),
//     rating: v.number(),
//   },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Unauthorized");

//     return await ctx.db.insert("comments", {
//       interviewId: args.interviewId,
//       content: args.content,
//       rating: args.rating,
//       interviewerId: identity.subject,
//     });
//   },
// });

// // get all comments for an interview
// export const getComments = query({
//   args: { interviewId: v.id("interviews") },
//   handler: async (ctx, args) => {
//     const comments = await ctx.db
//       .query("comments")
//       .withIndex("by_interview_id", (q) => q.eq("interviewId", args.interviewId))
//       .collect();

//     return comments;
//   },
// });


import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addComment = mutation({
  args: {
    interviewId: v.id("interviews"),
    content: v.string(),
    rating: v.number(),
    technicalSkills: v.optional(v.number()),
    communication: v.optional(v.number()),
    problemSolving: v.optional(v.number()),
    attitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("comments", {
      interviewId: args.interviewId,
      content: args.content,
      rating: args.rating,
      technicalSkills: args.technicalSkills,
      communication: args.communication,
      problemSolving: args.problemSolving,
      attitude: args.attitude,
      interviewerId: identity.subject,
    });
  },
});

export const getComments = query({
  args: { interviewId: v.id("interviews") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_interview_id", (q) => q.eq("interviewId", args.interviewId))
      .collect();
  },
});

export const getAllCommentsWithDetails = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const allComments = await ctx.db.query("comments").collect();
    const allUsers = await ctx.db.query("users").collect();
    const allInterviews = await ctx.db.query("interviews").collect();

    return allComments.map((comment) => {
      const interview = allInterviews.find((i) => i._id === comment.interviewId);
      const interviewer = allUsers.find((u) => u.clerkId === comment.interviewerId);
      const candidate = interview
        ? allUsers.find((u) => u.clerkId === interview.candidateId)
        : null;

      return {
        ...comment,
        interviewTitle: interview?.title ?? "Unknown Interview",
        interviewStatus: interview?.status ?? "unknown",
        interviewStartTime: interview?.startTime ?? 0,
        interviewerName: interviewer?.name ?? "Unknown Interviewer",
        interviewerImage: interviewer?.image,
        candidateName: candidate?.name ?? "Unknown Candidate",
        candidateImage: candidate?.image,
        candidateClerkId: interview?.candidateId ?? "",
        isRedFlag: comment.rating <= 2,
      };
    }).sort((a, b) => b._creationTime - a._creationTime);
  },
});