"use client";

import LoaderUI from "@/components/LoaderUI";
import { useUserRole } from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";
import InterviewScheduleUI from "./InterviewScheduleUI";
import { useEffect } from "react";

function SchedulePage() {
  const router = useRouter();
  const { isInterviewer, isLoading } = useUserRole();

  useEffect(() => {
    if (!isLoading && !isInterviewer) {
      alert("🚫 Access Denied! Only Interviewers can access this page.");
      router.push("/");
    }
  }, [isInterviewer, isLoading, router]);

  if (isLoading) return <LoaderUI />;
  if (!isInterviewer) return null;

  return <InterviewScheduleUI />;
}

export default SchedulePage;