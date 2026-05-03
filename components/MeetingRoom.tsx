"use client";
import {
  CallControls,
  CallingState,
  CallParticipantsList,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { LayoutListIcon, LoaderIcon, UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import EndCallButton from "./EndCallButton";
import CodeEditor from "./CodeEditor";
//import CodeEditor from "./CodeEditor";

export default function MeetingRoom() {
  const router = useRouter();
  const [layout, setLayout] = useState<"grid" | "speaker">("speaker");
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0d1117]">
        <LoaderIcon className="size-6 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0d1117]">
      <ResizablePanelGroup
        orientation="horizontal"
        className="h-full w-full"
      >
        {/* LEFT SIDE — Video Panel */}
        <ResizablePanel
          defaultSize={40}
          minSize={25}
          className="relative flex flex-col h-full"
        >
          {/* Video area fills all available height */}
          <div className="flex-1 relative bg-[#0d1117] overflow-hidden">
            {layout === "grid" ? <PaginatedGridLayout /> : <SpeakerLayout />}

            {/* Participants sidebar overlay */}
            {showParticipants && (
              <div className="absolute right-0 top-0 h-full w-[280px] bg-[#161b22]/95 backdrop-blur-sm z-10 border-l border-white/10">
                <CallParticipantsList
                  onClose={() => setShowParticipants(false)}
                />
              </div>
            )}
          </div>

          {/* Controls bar — pinned to bottom of left panel */}
          <div className="flex-none flex justify-center items-center gap-2 px-4 py-3 bg-[#0d1117]/80 backdrop-blur-sm border-t border-white/10">
            <CallControls onLeave={() => router.push("/")} />

            {/* Layout switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-[#1c2128] border-white/20 hover:bg-[#2d333b] text-white h-9 w-9 rounded-full"
                >
                  <LayoutListIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-[#1c2128] border border-white/20 text-white min-w-[140px]"
                align="end"
              >
                <DropdownMenuItem
                  onClick={() => setLayout("grid")}
                  className="hover:bg-white/10 cursor-pointer"
                >
                  Grid View
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLayout("speaker")}
                  className="hover:bg-white/10 cursor-pointer"
                >
                  Speaker View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Participants toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowParticipants(!showParticipants)}
              className="bg-[#1c2128] border-white/20 hover:bg-[#2d333b] text-white h-9 w-9 rounded-full"
            >
              <UsersIcon className="size-4" />
            </Button>
            <EndCallButton />
          </div>
        </ResizablePanel>

        {/* Resize handle */}
        <ResizableHandle withHandle className="bg-white/10 hover:bg-white/20 transition-colors" />

        {/* RIGHT SIDE — Code Editor */}
        <ResizablePanel
          defaultSize={60}
          minSize={30}
          className="h-full bg-[#0d1117]"
        >
          <div className="h-full w-full text-white/40 flex items-start p-4 font-mono text-sm">
            <CodeEditor />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}