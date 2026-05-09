// "use client";

// import Link from "next/link";
// import { Button } from "./ui/button";
// import { SparklesIcon } from "lucide-react";
// import { useUserRole } from "@/hooks/useUserRole";

// function DasboardBtn() {
//   const {isCandidate,isLoading} = useUserRole(); // useUserRole();

//   if (isCandidate || isLoading) return null;

//   return (
//     <Link href={"/dashboard"}>
//       <Button className="gap-2 font-medium" size={"sm"}>
//         <SparklesIcon className="size-4" />
//         Dashboard
//       </Button>
//     </Link>
//   );
// }
// export default DasboardBtn;


"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import LoaderUI from "@/components/LoaderUI";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SparklesIcon } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isAdmin, isInterviewer, isLoading } = useUserRole();

  // 🔥 Redirect ONLY admin
  useEffect(() => {
    if (!isLoading && isAdmin) {
      router.replace("/admin");
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) return <LoaderUI />;

  return (
    <div className="p-6 flex flex-col items-center justify-center gap-6">
      
      {/* 👨‍💻 Show button ONLY for interviewer */}
      {isInterviewer && (
        <Link href="/dashboard">
          <Button className="gap-2 font-medium" size={"sm"}>
        <SparklesIcon className="size-4" />
        Dashboard
      </Button>
        </Link>
      )}

      {/* 👤 Optional: Candidate message */}
      
    </div>
  );
}