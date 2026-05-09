// import { v } from "convex/values";
// import { mutation, query } from "./_generated/server";

// export const syncUser = mutation({
//   args: {
//     name: v.string(),
//     email: v.string(),
//     clerkId: v.string(),
//     image: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     const existingUser = await ctx.db
//       .query("users")
//       .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
//       .first();

//     if (existingUser) return;

//     return await ctx.db.insert("users", {
//       ...args,
//       role: "candidate",
//     });
//   },
// });

// export const getUsers = query({
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("User is not authenticated");

//     const users = await ctx.db.query("users").collect();

//     return users;
//   },
// });

// export const getUserByClerkId = query({
//   args: { clerkId: v.string() },
//   handler: async (ctx, args) => {
//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
//       .first();

//     return user;
//   },
// });


import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const ADMIN_EMAIL = "hiteshkatta14@gmail.com";

export const syncUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (existingUser) return;

    const role = args.email === ADMIN_EMAIL ? "admin" : "candidate";

    return await ctx.db.insert("users", {
      ...args,
      role,
    });
  },
});

export const makeAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) throw new Error(`No user found with email: ${args.email}`);

    await ctx.db.patch(user._id, { role: "admin" });
    return { success: true, name: user.name, email: user.email };
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("candidate"), v.literal("interviewer"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!caller || caller.role !== "admin") throw new Error("Only admins can change roles");

    return await ctx.db.patch(args.userId, { role: args.role });
  },
});

// ── QUERIES — return [] or null instead of throwing when not authed ──

export const getUsers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("users").collect();
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const getInterviewers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "interviewer"))
      .collect();
  },
});

export const getCandidates = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "candidate"))
      .collect();
  },
});