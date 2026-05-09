"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import { useUser } from "@clerk/nextjs";
import LoaderUI from "@/components/LoaderUI";
import { useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  UsersIcon, BarChart3Icon, ActivityIcon,
  CheckCircle2Icon, XCircleIcon, CalendarIcon,
  StarIcon, TrendingUpIcon, ShieldIcon, VideoIcon,
  MessageSquareIcon, ZapIcon, ClockIcon,
  UserCheckIcon, AlertTriangleIcon, FlagIcon,
  TrophyIcon, BrainIcon, MicIcon, HeartHandshakeIcon,
} from "lucide-react";

/* ─── Stat Card ──────────────────────────────── */
function StatCard({ label, value, icon: Icon, sub, accent, pulse }: {
  label: string; value: string | number; icon: React.ElementType;
  sub?: string; accent: string; pulse?: boolean;
}) {
  const map: Record<string, string> = {
    violet:  "text-violet-500 bg-violet-500/10 border-violet-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    sky:     "text-sky-500 bg-sky-500/10 border-sky-500/20",
    amber:   "text-amber-500 bg-amber-500/10 border-amber-500/20",
    red:     "text-red-500 bg-red-500/10 border-red-500/20",
    teal:    "text-teal-500 bg-teal-500/10 border-teal-500/20",
    rose:    "text-rose-500 bg-rose-500/10 border-rose-500/20",
  };
  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`relative w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${map[accent]}`}>
          <Icon className="h-5 w-5" />
          {pulse && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-background animate-pulse" />}
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
          {sub && <p className="text-[11px] text-muted-foreground/60 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Pass Rate Ring ─────────────────────────── */
function PassRateRing({ rate }: { rate: number }) {
  const r = 36, circ = 2 * Math.PI * r, dash = (rate / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="currentColor" strokeWidth="7" className="text-muted/30" />
          <circle cx="44" cy="44" r={r} fill="none" stroke="url(#rg)" strokeWidth="7"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
          <defs>
            <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold">{rate}%</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground font-medium">Pass Rate</p>
    </div>
  );
}

/* ─── Dimension Bar ──────────────────────────── */
function DimBar({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  const pct = (value / 5) * 100;
  const color = value >= 4 ? "bg-emerald-500" : value >= 3 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold w-5 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

/* ─── Stars ──────────────────────────────────── */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <StarIcon key={s} className={`h-3.5 w-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/25"}`} />
      ))}
    </div>
  );
}

/* ─── Candidate Scorecard ────────────────────── */
function CandidateScorecard({ comments }: { comments: any[] }) {
  // Group by candidate
  const byCandidate: Record<string, any[]> = {};
  comments.forEach((c) => {
    const key = c.candidateClerkId;
    if (!byCandidate[key]) byCandidate[key] = [];
    byCandidate[key].push(c);
  });

  const scorecards = Object.entries(byCandidate).map(([, coms]) => {
    const avg = (field: string) => {
      const vals = coms.map((c: any) => c[field]).filter(Boolean);
      return vals.length ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : 0;
    };
    const hasRedFlag = coms.some((c: any) => c.rating <= 2);
    return {
      candidateName: coms[0].candidateName,
      candidateImage: coms[0].candidateImage,
      totalFeedback: coms.length,
      overallRating: avg("rating"),
      technicalSkills: avg("technicalSkills"),
      communication: avg("communication"),
      problemSolving: avg("problemSolving"),
      attitude: avg("attitude"),
      hasRedFlag,
      latestStatus: coms[0].interviewStatus,
    };
  }).sort((a, b) => b.overallRating - a.overallRating);

  if (scorecards.length === 0) return (
    <div className="text-center py-10 text-sm text-muted-foreground">No feedback submitted yet.</div>
  );

  return (
    <div className="space-y-4">
      {scorecards.map((sc, i) => (
        <div key={i} className={`rounded-xl border p-4 space-y-3 ${sc.hasRedFlag ? "border-rose-500/30 bg-rose-500/5" : ""}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={sc.candidateImage} />
                  <AvatarFallback className="text-xs bg-sky-500/20 text-sky-700">
                    {sc.candidateName?.split(" ").map((n: string) => n[0]).join("").slice(0,2)}
                  </AvatarFallback>
                </Avatar>
                {i === 0 && <TrophyIcon className="absolute -top-1 -right-1 h-3.5 w-3.5 text-amber-500" />}
              </div>
              <div>
                <p className="text-sm font-semibold">{sc.candidateName}</p>
                <p className="text-xs text-muted-foreground">{sc.totalFeedback} feedback {sc.totalFeedback === 1 ? "entry" : "entries"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {sc.hasRedFlag && (
                <Badge variant="destructive" className="text-[10px] gap-1">
                  <FlagIcon className="h-3 w-3" /> Red Flag
                </Badge>
              )}
              <div className="text-right">
                <p className="text-lg font-bold">{sc.overallRating.toFixed(1)}<span className="text-xs text-muted-foreground">/5</span></p>
                <Stars rating={Math.round(sc.overallRating)} />
              </div>
            </div>
          </div>

          {(sc.technicalSkills > 0 || sc.communication > 0 || sc.problemSolving > 0 || sc.attitude > 0) && (
            <div className="space-y-1.5 pt-1">
              {sc.technicalSkills > 0 && <DimBar label="Technical Skills" value={sc.technicalSkills} icon={BrainIcon} />}
              {sc.communication > 0 && <DimBar label="Communication" value={sc.communication} icon={MicIcon} />}
              {sc.problemSolving > 0 && <DimBar label="Problem Solving" value={sc.problemSolving} icon={ZapIcon} />}
              {sc.attitude > 0 && <DimBar label="Attitude & Culture" value={sc.attitude} icon={HeartHandshakeIcon} />}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Feedback Feed ──────────────────────────── */
function FeedbackFeed({ comments }: { comments: any[] }) {
  const [filter, setFilter] = useState<"all" | "redflag">("all");
  const filtered = filter === "redflag" ? comments.filter((c) => c.isRedFlag) : comments;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === "all" ? "bg-background border shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          All Feedback ({comments.length})
        </button>
        <button onClick={() => setFilter("redflag")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${filter === "redflag" ? "bg-rose-500/10 border border-rose-500/30 text-rose-600" : "text-muted-foreground hover:text-rose-500"}`}>
          <FlagIcon className="h-3 w-3" /> Red Flags ({comments.filter(c => c.isRedFlag).length})
        </button>
      </div>

      <ScrollArea className="h-[480px] pr-2">
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">No entries found.</div>
          ) : (
            filtered.map((c, i) => (
              <div key={i} className={`rounded-xl border p-4 space-y-3 ${c.isRedFlag ? "border-rose-500/30 bg-rose-500/5" : "bg-card"}`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={c.interviewerImage} />
                      <AvatarFallback className="text-xs">{c.interviewerName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{c.interviewerName}</p>
                        <span className="text-muted-foreground text-xs">on</span>
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 truncate">{c.candidateName}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {c.interviewTitle} · {format(c._creationTime, "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.isRedFlag && (
                      <Badge variant="destructive" className="text-[10px] gap-1">
                        <FlagIcon className="h-3 w-3" />Red Flag
                      </Badge>
                    )}
                    <div className="text-right">
                      <p className="text-base font-bold">{c.rating}<span className="text-xs text-muted-foreground">/5</span></p>
                      <Stars rating={c.rating} />
                    </div>
                  </div>
                </div>

                {/* Dimension bars */}
                {(c.technicalSkills || c.communication || c.problemSolving || c.attitude) && (
                  <div className="space-y-1.5 border-t pt-2">
                    {c.technicalSkills && <DimBar label="Technical" value={c.technicalSkills} icon={BrainIcon} />}
                    {c.communication && <DimBar label="Communication" value={c.communication} icon={MicIcon} />}
                    {c.problemSolving && <DimBar label="Problem Solving" value={c.problemSolving} icon={ZapIcon} />}
                    {c.attitude && <DimBar label="Attitude" value={c.attitude} icon={HeartHandshakeIcon} />}
                  </div>
                )}

                {/* Comment */}
                <p className="text-sm text-muted-foreground leading-relaxed border-t pt-2">{c.content}</p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

/* ─── Interviewer Leaderboard ────────────────── */
function Leaderboard({ interviewers }: { interviewers: any[] }) {
  const sorted = [...interviewers].sort((a, b) => {
    if (b.passRate !== a.passRate) return b.passRate - a.passRate;
    return b.total - a.total;
  });

  const medal = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-3">
      {sorted.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">No interviewers yet.</div>
      ) : (
        sorted.map((iv, i) => {
          const passColor = iv.passRate >= 70 ? "text-emerald-500" : iv.passRate >= 40 ? "text-amber-500" : "text-rose-500";
          return (
            <div key={iv._id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${i === 0 ? "border-amber-500/30 bg-amber-500/5" : "bg-card"}`}>
              <span className="text-lg w-6 text-center">{medal[i] ?? `#${i+1}`}</span>
              <Avatar className="h-8 w-8">
                <AvatarImage src={iv.image} />
                <AvatarFallback className="text-xs">{iv.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{iv.name}</p>
                <p className="text-xs text-muted-foreground truncate">{iv.email}</p>
              </div>
              <div className="flex gap-4 text-xs shrink-0">
                <div className="text-center">
                  <p className="font-bold">{iv.total}</p>
                  <p className="text-muted-foreground">Done</p>
                </div>
                <div className="text-center">
                  <p className={`font-bold ${passColor}`}>{iv.passRate}%</p>
                  <p className="text-muted-foreground">Pass</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-amber-500">{iv.avgRating}</p>
                  <p className="text-muted-foreground">Avg</p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

/* ─── Interviewer Role Row ───────────────────── */
function InterviewerRow({ interviewer, onRoleChange }: {
  interviewer: any;
  onRoleChange: (id: Id<"users">, role: "candidate"|"interviewer"|"admin") => void;
}) {
  const passColor = interviewer.passRate >= 70 ? "text-emerald-500" : interviewer.passRate >= 40 ? "text-amber-500" : "text-rose-500";
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={interviewer.image} />
        <AvatarFallback className="text-xs bg-violet-500/20 text-violet-700 dark:text-violet-300">
          {interviewer.name?.split(" ").map((n: string) => n[0]).join("").slice(0,2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{interviewer.name}</p>
        <p className="text-xs text-muted-foreground truncate">{interviewer.email}</p>
      </div>
      <div className="hidden sm:flex items-center gap-4 text-xs shrink-0">
        <div className="text-center"><p className="font-semibold">{interviewer.total}</p><p className="text-muted-foreground">Total</p></div>
        <div className="text-center"><p className={`font-semibold ${passColor}`}>{interviewer.passRate}%</p><p className="text-muted-foreground">Pass</p></div>
        <div className="text-center"><p className="font-semibold text-amber-500">{interviewer.avgRating}</p><p className="text-muted-foreground">Rating</p></div>
        <div className="text-center"><p className="font-semibold text-sky-500">{interviewer.upcoming}</p><p className="text-muted-foreground">Upcoming</p></div>
      </div>
      <Select defaultValue="interviewer"
        onValueChange={(val) => onRoleChange(interviewer._id, val as "candidate"|"interviewer"|"admin")}>
        <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="interviewer">Interviewer</SelectItem>
          <SelectItem value="candidate">Candidate</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

/* ─── Candidate Row ──────────────────────────── */
function CandidateRow({ candidate, onPromote }: {
  candidate: Doc<"users">; onPromote: (id: Id<"users">) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={candidate.image} />
        <AvatarFallback className="text-xs bg-sky-500/20 text-sky-700 dark:text-sky-300">
          {candidate.name?.split(" ").map((n) => n[0]).join("").slice(0,2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{candidate.name}</p>
        <p className="text-xs text-muted-foreground truncate">{candidate.email}</p>
      </div>
      <Badge variant="secondary" className="text-[10px] shrink-0">Candidate</Badge>
      <Button size="sm" variant="outline"
        className="h-7 text-xs shrink-0 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30"
        onClick={() => onPromote(candidate._id)}>
        <UserCheckIcon className="h-3 w-3 mr-1" />Make Interviewer
      </Button>
    </div>
  );
}

/* ─── Recent Row ─────────────────────────────── */
function RecentRow({ interview, users }: { interview: Doc<"interviews">; users: Doc<"users">[] }) {
  const candidate = users.find((u) => u.clerkId === interview.candidateId);
  const statusMap: Record<string, { label: string; cls: string }> = {
    upcoming:  { label: "Upcoming",  cls: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20" },
    completed: { label: "Completed", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
    succeeded: { label: "Passed",    cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
    failed:    { label: "Failed",    cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  };
  const s = statusMap[interview.status] ?? statusMap.upcoming;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-0">
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarImage src={candidate?.image} />
        <AvatarFallback className="text-[10px]">{candidate?.name?.charAt(0) ?? "?"}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{interview.title}</p>
        <p className="text-xs text-muted-foreground truncate">
          {candidate?.name ?? "Unknown"} · {format(new Date(interview.startTime), "MMM d, h:mm a")}
        </p>
      </div>
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${s.cls}`}>{s.label}</span>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────── */
export default function AdminPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { isAdmin, isLoading } = useUserRole();

  const stats      = useQuery(api.admin.getAdminStats, !isLoading && isAdmin ? {} : "skip");
  const allUsers   = useQuery(api.users.getUsers, !isLoading && isAdmin ? {} : "skip");
  const candidates = useQuery(api.users.getCandidates, !isLoading && isAdmin ? {} : "skip");
  const allComments = useQuery(api.comments.getAllCommentsWithDetails, !isLoading && isAdmin ? {} : "skip");
  const updateRole = useMutation(api.users.updateUserRole);

  const [activeTab, setActiveTab] = useState<"overview"|"feedback"|"leaderboard"|"interviewers"|"candidates">("overview");

  if (!isLoaded || isLoading) return <LoaderUI />;
  if (!user || !isAdmin) { router.push("/"); return null; }

  const handleRoleChange = async (userId: Id<"users">, role: "candidate"|"interviewer"|"admin") => {
    try { await updateRole({ userId, role }); toast.success(`Role updated to ${role}`); }
    catch { toast.error("Failed to update role"); }
  };

  const handlePromote = async (userId: Id<"users">) => {
    try { await updateRole({ userId, role: "interviewer" }); toast.success("Promoted to interviewer!"); }
    catch { toast.error("Failed to promote user"); }
  };

  const redFlagCount = allComments?.filter((c: any) => c.isRedFlag).length ?? 0;

  const tabs = [
    { id: "overview",     label: "Overview",    icon: BarChart3Icon },
    { id: "feedback",     label: "Feedback",     icon: MessageSquareIcon, badge: redFlagCount > 0 ? redFlagCount : undefined },
    { id: "leaderboard",  label: "Leaderboard",  icon: TrophyIcon },
    { id: "interviewers", label: "Interviewers", icon: UsersIcon },
    { id: "candidates",   label: "Candidates",   icon: UserCheckIcon },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <ShieldIcon className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Admin Control Center</h1>
              <p className="text-sm text-muted-foreground">Full platform overview — CodeSync</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {redFlagCount > 0 && (
              <Badge variant="destructive" className="gap-1 px-3">
                <FlagIcon className="h-3 w-3" />{redFlagCount} Red Flag{redFlagCount !== 1 ? "s" : ""}
              </Badge>
            )}
            <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 px-3 py-1">
              <ShieldIcon className="h-3 w-3 mr-1" />Admin
            </Badge>
          </div>
        </div>

        {/* Live Banner */}
        {stats && stats.liveNow > 0 && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-5 py-3 flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <VideoIcon className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {stats.liveNow} interview{stats.liveNow !== 1 ? "s" : ""} live right now
            </p>
          </div>
        )}

        {/* Stats */}
        {stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="col-span-2">
              <StatCard label="Total Users" value={stats.totalUsers} icon={UsersIcon} accent="violet"
                sub={`${stats.totalInterviewers} interviewers · ${stats.totalCandidates} candidates`} />
            </div>
            <div className="col-span-2">
              <StatCard label="Total Interviews" value={stats.totalInterviews} icon={BarChart3Icon} accent="sky"
                sub={`${stats.today} today`} />
            </div>
            <StatCard label="Live"     value={stats.liveNow}   icon={ActivityIcon}     accent="red"     pulse={stats.liveNow > 0} />
            <StatCard label="Upcoming" value={stats.upcoming}  icon={CalendarIcon}     accent="amber" />
            <StatCard label="Passed"   value={stats.succeeded} icon={CheckCircle2Icon} accent="emerald" />
            <StatCard label="Failed"   value={stats.failed}    icon={XCircleIcon}      accent="rose" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({length:6}).map((_,i) => <div key={i} className="h-20 rounded-xl bg-muted/40 animate-pulse" />)}
          </div>
        )}

        {/* Analytics Row */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5 flex items-center gap-5">
                <PassRateRing rate={stats.passRate} />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />
                    <span className="text-muted-foreground">Passed</span>
                    <span className="font-semibold ml-auto">{stats.succeeded}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <XCircleIcon className="h-4 w-4 text-rose-500" />
                    <span className="text-muted-foreground">Failed</span>
                    <span className="font-semibold ml-auto">{stats.failed}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="h-4 w-4 text-amber-500" />
                    <span className="text-muted-foreground">Pending</span>
                    <span className="font-semibold ml-auto">{stats.completed - stats.succeeded - stats.failed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="text-sm font-medium text-muted-foreground">Platform Health</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-4 space-y-3">
                {[
                  { icon: StarIcon, label: "Avg. Rating", value: `${stats.avgRating}/5`, cls: "text-amber-500" },
                  { icon: MessageSquareIcon, label: "Total Feedback", value: stats.totalComments, cls: "" },
                  { icon: TrendingUpIcon, label: "Completion", value: `${stats.totalInterviews > 0 ? Math.round((stats.completed/stats.totalInterviews)*100) : 0}%`, cls: "text-emerald-500" },
                  { icon: ZapIcon, label: "Interviewers", value: stats.totalInterviewers, cls: "text-violet-500" },
                ].map(({ icon: Icon, label, value, cls }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><Icon className={`h-4 w-4 ${cls || "text-sky-500"}`} /><span className="text-muted-foreground">{label}</span></div>
                    <span className={`font-bold ${cls}`}>{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="text-sm font-medium text-muted-foreground">Recent Interviews</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-2">
                {allUsers && stats.recentInterviews.length > 0
                  ? stats.recentInterviews.map((iv: Doc<"interviews">) => <RecentRow key={iv._id} interview={iv} users={allUsers} />)
                  : <p className="text-sm text-muted-foreground py-4 text-center">No interviews yet</p>}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted border w-fit overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon, badge }: any) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`relative flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              <Icon className="h-3.5 w-3.5" />{label}
              {badge && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === "overview" && stats && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Interviewer Performance</CardTitle></CardHeader>
            <CardContent>
              {stats.interviewerActivity.length === 0
                ? <div className="text-center py-10 text-muted-foreground"><AlertTriangleIcon className="h-8 w-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No interviewers yet.</p></div>
                : stats.interviewerActivity.map((iv: any) => <InterviewerRow key={iv._id} interviewer={iv} onRoleChange={handleRoleChange} />)}
            </CardContent>
          </Card>
        )}

        {/* Tab: Feedback */}
        {activeTab === "feedback" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">All Feedback</CardTitle>
                  {redFlagCount > 0 && <Badge variant="destructive" className="gap-1 text-xs"><FlagIcon className="h-3 w-3" />{redFlagCount} red flags</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <FeedbackFeed comments={allComments ?? []} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Candidate Scorecards</CardTitle></CardHeader>
              <CardContent>
                <CandidateScorecard comments={allComments ?? []} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: Leaderboard */}
        {activeTab === "leaderboard" && stats && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><TrophyIcon className="h-4 w-4 text-amber-500" />Interviewer Leaderboard</CardTitle>
                <Badge variant="outline">{stats.interviewerActivity.length} interviewers</Badge>
              </div>
            </CardHeader>
            <CardContent><Leaderboard interviewers={stats.interviewerActivity} /></CardContent>
          </Card>
        )}

        {/* Tab: Interviewers */}
        {activeTab === "interviewers" && stats && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Manage Interviewers</CardTitle>
                <Badge variant="outline">{stats.totalInterviewers} total</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {stats.interviewerActivity.length === 0
                ? <div className="text-center py-10 text-muted-foreground text-sm">No interviewers yet. Promote from Candidates tab.</div>
                : stats.interviewerActivity.map((iv: any) => <InterviewerRow key={iv._id} interviewer={iv} onRoleChange={handleRoleChange} />)}
            </CardContent>
          </Card>
        )}

        {/* Tab: Candidates */}
        {activeTab === "candidates" && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">All Candidates</CardTitle>
                <Badge variant="outline">{candidates?.length ?? 0} total</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {!candidates || candidates.length === 0
                ? <div className="text-center py-10 text-muted-foreground text-sm">No candidates yet.</div>
                : candidates.map((c) => <CandidateRow key={c._id} candidate={c} onPromote={handlePromote} />)}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}