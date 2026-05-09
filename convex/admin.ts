import { query } from "./_generated/server";

export const getAdminStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null; 
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) throw new Error("Unauthorized");

    const now = Date.now();
    const allUsers = await ctx.db.query("users").collect();
    const allInterviews = await ctx.db.query("interviews").collect();
    const allComments = await ctx.db.query("comments").collect();

    const candidates = allUsers.filter((u) => u.role === "candidate");
    const interviewers = allUsers.filter((u) => u.role === "interviewer");

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const live = allInterviews.filter((i) => {
      const end = i.startTime + 60 * 60 * 1000;
      return (
        i.status !== "completed" &&
        i.status !== "failed" &&
        i.status !== "succeeded" &&
        i.startTime <= now &&
        now <= end
      );
    });

    const upcoming = allInterviews.filter(
      (i) =>
        i.status !== "completed" &&
        i.status !== "failed" &&
        i.status !== "succeeded" &&
        i.startTime > now
    );

    const completed = allInterviews.filter(
      (i) =>
        i.status === "completed" ||
        i.status === "succeeded" ||
        i.status === "failed"
    );

    const succeeded = allInterviews.filter((i) => i.status === "succeeded");
    const failed = allInterviews.filter((i) => i.status === "failed");

    const today = allInterviews.filter(
      (i) =>
        i.startTime >= todayStart.getTime() &&
        i.startTime <= todayEnd.getTime()
    );

    const passRate =
      completed.length > 0
        ? Math.round((succeeded.length / completed.length) * 100)
        : 0;

    const avgRating =
      allComments.length > 0
        ? (
            allComments.reduce((sum, c) => sum + c.rating, 0) /
            allComments.length
          ).toFixed(1)
        : "0.0";

    // Per-interviewer activity
    const interviewerActivity = interviewers.map((interviewer) => {
      const theirInterviews = allInterviews.filter((i) =>
        i.interviewerIds.includes(interviewer.clerkId)
      );
      const theirSucceeded = theirInterviews.filter(
        (i) => i.status === "succeeded"
      );
      const theirCompleted = theirInterviews.filter(
        (i) =>
          i.status === "completed" ||
          i.status === "succeeded" ||
          i.status === "failed"
      );
      const theirComments = allComments.filter((c) =>
        c.interviewerId === interviewer.clerkId
      );
      const theirAvgRating =
        theirComments.length > 0
          ? (
              theirComments.reduce((s, c) => s + c.rating, 0) /
              theirComments.length
            ).toFixed(1)
          : "0.0";

      return {
        _id: interviewer._id,
        name: interviewer.name,
        email: interviewer.email,
        image: interviewer.image,
        total: theirInterviews.length,
        completed: theirCompleted.length,
        succeeded: theirSucceeded.length,
        passRate:
          theirCompleted.length > 0
            ? Math.round((theirSucceeded.length / theirCompleted.length) * 100)
            : 0,
        avgRating: theirAvgRating,
        upcoming: theirInterviews.filter(
          (i) =>
            i.status !== "completed" &&
            i.status !== "failed" &&
            i.status !== "succeeded" &&
            i.startTime > now
        ).length,
      };
    });

    // Recent interviews (last 5)
    const recentInterviews = [...allInterviews]
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, 5);

    return {
      totalUsers: allUsers.length,
      totalCandidates: candidates.length,
      totalInterviewers: interviewers.length,
      totalInterviews: allInterviews.length,
      liveNow: live.length,
      today: today.length,
      upcoming: upcoming.length,
      completed: completed.length,
      succeeded: succeeded.length,
      failed: failed.length,
      passRate,
      avgRating,
      totalComments: allComments.length,
      interviewerActivity,
      recentInterviews,
      liveInterviews: live,
    };
  },
});