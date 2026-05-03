import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import { CodeIcon } from "lucide-react";
import {
  Show,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import DasboardBtn from "./DashboardBtn";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex h-16 items-center px-4">
        
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-semibold font-mono"
        >
          <CodeIcon className="size-8 text-emerald-500" />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            CodeSync
          </span>
        </Link>

        {/* RIGHT SIDE */}
        <div className="ml-auto flex items-center gap-3">

          {/* SIGNED OUT */}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </SignInButton>
          </Show>

          {/* SIGNED IN */}
          <Show when="signed-in">
            <DasboardBtn />
          <ModeToggle />
            <UserButton />
          </Show>
        </div>
      </div>
    </nav>
  );
}