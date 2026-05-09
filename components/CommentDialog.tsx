// import { useState } from "react";
// import { Id } from "../convex/_generated/dataModel";
// import { useMutation, useQuery } from "convex/react";
// import { api } from "../convex/_generated/api";
// import toast from "react-hot-toast";
// import { MessageSquareIcon, StarIcon } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "./ui/dialog";
// import { Button } from "./ui/button";
// import { Badge } from "./ui/badge";
// import { ScrollArea } from "./ui/scroll-area";
// import { getInterviewerInfo } from "@/lib/utils";
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { format } from "date-fns";
// import { Label } from "./ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
// import { Textarea } from "./ui/textarea";

// function CommentDialog({ interviewId }: { interviewId: Id<"interviews"> }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [comment, setComment] = useState("");
//   const [rating, setRating] = useState("3");

//   const addComment = useMutation(api.comments.addComment);
//   const users = useQuery(api.users.getUsers);
//   const existingComments = useQuery(api.comments.getComments, { interviewId });

//   const handleSubmit = async () => {
//     if (!comment.trim()) return toast.error("Please enter comment");

//     try {
//       await addComment({
//         interviewId,
//         content: comment.trim(),
//         rating: parseInt(rating),
//       });

//       toast.success("Comment submitted");
//       setComment("");
//       setRating("3");
//       setIsOpen(false);
//     } catch (error) {
//       toast.error("Failed to submit comment");
//     }
//   };

//   const renderStars = (rating: number) => (
//     <div className="flex gap-0.5">
//       {[1, 2, 3, 4, 5].map((starValue) => (
//         <StarIcon
//           key={starValue}
//           className={`h-4 w-4 ${starValue <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
//         />
//       ))}
//     </div>
//   );

//   if (existingComments === undefined || users === undefined) return null;

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       {/* TRIGGER BUTTON */}
//       <DialogTrigger asChild>
//         <Button variant="secondary" className="w-full">
//           <MessageSquareIcon className="h-4 w-4 mr-2" />
//           Add Comment
//         </Button>
//       </DialogTrigger>

//       <DialogContent className="sm:max-w-[600px]">
//         <DialogHeader>
//           <DialogTitle>Interview Comment</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-6">
//           {existingComments.length > 0 && (
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <h4 className="text-sm font-medium">Previous Comments</h4>
//                 <Badge variant="outline">
//                   {existingComments.length} Comment{existingComments.length !== 1 ? "s" : ""}
//                 </Badge>
//               </div>

//               {/* DISPLAY EXISTING COMMENTS */}
//               <ScrollArea className="h-[240px]">
//                 <div className="space-y-4">
//                   {existingComments.map((comment, index) => {
//                     const interviewer = getInterviewerInfo(users, comment.interviewerId);
//                     return (
//                       <div key={index} className="rounded-lg border p-4 space-y-3">
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-2">
//                             <Avatar className="h-8 w-8">
//                               <AvatarImage src={interviewer.image} />
//                               <AvatarFallback>{interviewer.initials}</AvatarFallback>
//                             </Avatar>
//                             <div>
//                               <p className="text-sm font-medium">{interviewer.name}</p>
//                               <p className="text-xs text-muted-foreground">
//                                 {format(comment._creationTime, "MMM d, yyyy • h:mm a")}
//                               </p>
//                             </div>
//                           </div>
//                           {renderStars(comment.rating)}
//                         </div>
//                         <p className="text-sm text-muted-foreground">{comment.content}</p>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </ScrollArea>
//             </div>
//           )}

//           <div className="space-y-4">
//             {/* RATING */}
//             <div className="space-y-2">
//               <Label>Rating</Label>
//               <Select value={rating} onValueChange={setRating}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select rating" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {[1, 2, 3, 4, 5].map((value) => (
//                     <SelectItem key={value} value={value.toString()}>
//                       <div className="flex items-center gap-2">{renderStars(value)}</div>
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* COMMENT */}
//             <div className="space-y-2">
//               <Label>Your Comment</Label>
//               <Textarea
//                 value={comment}
//                 onChange={(e) => setComment(e.target.value)}
//                 placeholder="Share your detailed comment about the candidate..."
//                 className="h-32"
//               />
//             </div>
//           </div>
//         </div>

//         {/* BUTTONS */}
//         <DialogFooter>
//           <Button variant="outline" onClick={() => setIsOpen(false)}>
//             Cancel
//           </Button>
//           <Button onClick={handleSubmit}>Submit</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
// export default CommentDialog;


import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import toast from "react-hot-toast";
import { MessageSquareIcon, StarIcon } from "lucide-react";
import {
  Dialog, DialogContent, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { getInterviewerInfo } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { format } from "date-fns";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

/* ─── Star Picker ─────────────────────────────────────────── */
function StarPicker({
  value, onChange, label,
}: {
  value: number; onChange: (v: number) => void; label: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground w-36">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <StarIcon
              className={`h-5 w-5 transition-colors ${
                star <= value
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40 hover:text-amber-300"
              }`}
            />
          </button>
        ))}
      </div>
      <span className="text-xs font-medium w-6 text-right text-muted-foreground">{value}/5</span>
    </div>
  );
}

/* ─── Render Stars (read-only) ────────────────────────────── */
function RenderStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <StarIcon
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

/* ─── Dimension Bar ───────────────────────────────────────── */
function DimensionBar({ label, value }: { label: string; value?: number }) {
  if (!value) return null;
  const pct = (value / 5) * 100;
  const color =
    value >= 4 ? "bg-emerald-500" : value >= 3 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-medium w-4 text-right">{value}</span>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────── */
function CommentDialog({ interviewId }: { interviewId: Id<"interviews"> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(3);
  const [technicalSkills, setTechnicalSkills] = useState(3);
  const [communication, setCommunication] = useState(3);
  const [problemSolving, setProblemSolving] = useState(3);
  const [attitude, setAttitude] = useState(3);

  const addComment = useMutation(api.comments.addComment);
  const users = useQuery(api.users.getUsers);
  const existingComments = useQuery(api.comments.getComments, { interviewId });

  const handleSubmit = async () => {
    if (!comment.trim()) return toast.error("Please enter a comment");
    try {
      await addComment({
        interviewId,
        content: comment.trim(),
        rating,
        technicalSkills,
        communication,
        problemSolving,
        attitude,
      });
      toast.success("Feedback submitted");
      setComment("");
      setRating(3);
      setTechnicalSkills(3);
      setCommunication(3);
      setProblemSolving(3);
      setAttitude(3);
      setIsOpen(false);
    } catch {
      toast.error("Failed to submit feedback");
    }
  };

  if (existingComments === undefined || users === undefined) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          <MessageSquareIcon className="h-4 w-4 mr-2" />
          {existingComments.length > 0 ? `Feedback (${existingComments.length})` : "Add Feedback"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareIcon className="h-4 w-4" />
            Interview Feedback
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">

          {/* ── Existing comments ── */}
          {existingComments.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Previous Feedback</h4>
                <Badge variant="outline" className="text-xs">
                  {existingComments.length} {existingComments.length === 1 ? "entry" : "entries"}
                </Badge>
              </div>
              <ScrollArea className="h-[220px] pr-2">
                <div className="space-y-3">
                  {existingComments.map((c, i) => {
                    const interviewer = getInterviewerInfo(users, c.interviewerId);
                    const isRedFlag = c.rating <= 2;
                    return (
                      <div
                        key={i}
                        className={`rounded-lg border p-4 space-y-3 ${isRedFlag ? "border-rose-500/30 bg-rose-500/5" : ""}`}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={interviewer.image} />
                              <AvatarFallback className="text-xs">{interviewer.initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{interviewer.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(c._creationTime, "MMM d, yyyy · h:mm a")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isRedFlag && (
                              <Badge variant="destructive" className="text-[10px] px-1.5">
                                ⚑ Red Flag
                              </Badge>
                            )}
                            <RenderStars rating={c.rating} />
                          </div>
                        </div>

                        {/* Dimension bars */}
                        {(c.technicalSkills || c.communication || c.problemSolving || c.attitude) && (
                          <div className="space-y-1.5 border-t pt-2">
                            <DimensionBar label="Technical Skills" value={c.technicalSkills} />
                            <DimensionBar label="Communication" value={c.communication} />
                            <DimensionBar label="Problem Solving" value={c.problemSolving} />
                            <DimensionBar label="Attitude & Culture" value={c.attitude} />
                          </div>
                        )}

                        {/* Comment text */}
                        <p className="text-sm text-muted-foreground leading-relaxed">{c.content}</p>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* ── New feedback form ── */}
          <div className="space-y-5 border-t pt-4">
            <h4 className="text-sm font-semibold">Add Your Feedback</h4>

            {/* Overall rating */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Overall Rating</Label>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110">
                    <StarIcon className={`h-7 w-7 transition-colors ${
                      star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30 hover:text-amber-300"
                    }`} />
                  </button>
                ))}
                <span className="text-sm text-muted-foreground ml-1">
                  {["", "Poor", "Below Average", "Average", "Good", "Excellent"][rating]}
                </span>
              </div>
            </div>

            {/* Dimension ratings */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Performance Breakdown</Label>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <StarPicker label="Technical Skills" value={technicalSkills} onChange={setTechnicalSkills} />
                <StarPicker label="Communication" value={communication} onChange={setCommunication} />
                <StarPicker label="Problem Solving" value={problemSolving} onChange={setProblemSolving} />
                <StarPicker label="Attitude & Culture" value={attitude} onChange={setAttitude} />
              </div>
            </div>

            {/* Comment text */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Detailed Notes</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share detailed observations about the candidate's performance, strengths, and areas for improvement..."
                className="h-28 resize-none"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CommentDialog;