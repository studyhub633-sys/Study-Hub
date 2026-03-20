import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { FriendProfile } from "@/lib/friends";
import { Loader2, Swords, Zap } from "lucide-react";
import { useState } from "react";

const SUBJECTS = [
  "Mathematics", "English Language", "English Literature",
  "Biology", "Chemistry", "Physics", "Combined Science",
  "History", "Geography", "Computer Science",
  "Religious Studies", "French", "Spanish", "German",
  "Business Studies", "Economics", "Psychology",
];

interface ChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friend: FriendProfile | null;
  onChallengeCreated?: () => void;
}

export function ChallengeModal({ open, onOpenChange, friend, onChallengeCreated }: ChallengeModalProps) {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [questionCount, setQuestionCount] = useState("5");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!user || !friend || !subject) return;

    setCreating(true);
    try {
      const { error } = await supabase.from("challenges").insert({
        challenger_id: user.id,
        challenged_id: friend.id,
        subject,
        question_count: parseInt(questionCount),
        challenger_score: 0,
        challenged_score: 0,
        status: "pending",
      });

      if (error) {
        if (error.message.includes("relation") || error.code === "42P01") {
          toast({
            title: "Setup Required",
            description: "The challenges table needs to be created. Please run the migration SQL.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Challenge sent! ⚔️",
        description: `${friend.full_name} will see your challenge request.`,
      });
      onOpenChange(false);
      onChallengeCreated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create challenge.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-red-500" />
            Challenge {friend?.full_name || "Friend"}
          </DialogTitle>
          <DialogDescription>
            Both players answer the same questions. Highest score wins!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Subject */}
          <div className="space-y-2">
            <Label>Subject *</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question Count */}
          <div className="space-y-2">
            <Label>Number of Questions</Label>
            <Select value={questionCount} onValueChange={setQuestionCount}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Questions</SelectItem>
                <SelectItem value="10">10 Questions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reward Info */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-500/20">
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium">Winner gets +25 XP</p>
              <p className="text-xs text-muted-foreground">Both players earn +10 XP for completing</p>
            </div>
          </div>

          {/* Create Button */}
          <Button
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg"
            size="lg"
            onClick={handleCreate}
            disabled={creating || !subject}
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Challenge...
              </>
            ) : (
              <>
                <Swords className="w-4 h-4 mr-2" />
                Send Challenge
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
