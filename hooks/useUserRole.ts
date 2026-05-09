// import { useUser } from "@clerk/nextjs";
// import { useQuery } from "convex/react";
// import { api } from "../convex/_generated/api";
// export const useUserRole = () => {
//   const { user } = useUser();

//   const userData = useQuery(api.users.getUserByClerkId, {
//     clerkId: user?.id || "",
//   });

//   const isLoading = userData === undefined;

//   return {
//     isLoading,
//     isInterviewer: userData?.role === "interviewer",
//     isCandidate: userData?.role === "candidate",
//   };
// };

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export const ADMIN_EMAIL = "hiteshkatta14@gmail.com";

export const useUserRole = () => {
  const { user, isLoaded } = useUser();

  const userData = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip" // ✅ FIX
  );

  const isLoading = !isLoaded || userData === undefined;

  return {
    isLoading,
    isAdmin: userData?.role === "admin",
    isInterviewer: userData?.role === "interviewer",
    isCandidate: userData?.role === "candidate",
    userData,
  };
};