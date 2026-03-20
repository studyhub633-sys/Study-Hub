import { ChallengeModal } from "@/components/ChallengeModal";
import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getFriends, type FriendProfile, type Friendship } from "@/lib/friends";
import {
  Check,
  Clock,
  Crown,
  Loader2,
  Play,
  Swords,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface ChallengeProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  subject: string;
  question_count: number;
  challenger_score: number;
  challenged_score: number;
  status: "pending" | "active" | "completed";
  created_at: string;
  challenger?: ChallengeProfile | ChallengeProfile[];
  challenged?: ChallengeProfile | ChallengeProfile[];
}

export default function Challenges() {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [friends, setFriends] = useState<(Friendship & { friend: FriendProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();

    // Check if we came from friends page with a specific friend
    const friendId = searchParams.get("friend");
    if (friendId) {
      loadFriendForChallenge(friendId);
    }
  }, [user]);

  const loadFriendForChallenge = async (friendId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, xp, study_hours")
      .eq("id", friendId)
      .single();

    if (data) {
      setSelectedFriend({
        id: data.id,
        full_name: data.full_name || data.email?.split("@")[0] || "User",
        email: data.email || "",
        avatar_url: data.avatar_url,
        xp: data.xp || 0,
        study_hours: data.study_hours || 0,
      });
      setShowChallengeModal(true);
    }
  };

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Load challenges
      const { data: challengeData, error } = await supabase
        .from("challenges")
        .select(`
          id, challenger_id, challenged_id, subject, question_count,
          challenger_score, challenged_score, status, created_at,
          challenger:profiles!challenges_challenger_id_fkey(id, full_name, avatar_url),
          challenged:profiles!challenges_challenged_id_fkey(id, full_name, avatar_url)
        `)
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.message.includes("relation") || error.code === "42P01") {
          // Table doesn't exist yet
          setChallenges([]);
        } else {
          console.error("Error loading challenges:", error);
        }
      } else {
        setChallenges(challengeData || []);
      }

      // Load friends for the "New Challenge" flow
      const friendsData = await getFriends(supabase, user.id);
      setFriends(friendsData);
    } catch (error) {
      console.error("Error loading challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChallenge = async (challengeId: string) => {
    setActionLoading(challengeId);
    try {
      const { error } = await supabase
        .from("challenges")
        .update({ status: "active" })
        .eq("id", challengeId);

      if (error) throw error;
      toast({ title: "Challenge accepted! ⚔️", description: "Time to prove yourself!" });
      await loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineChallenge = async (challengeId: string) => {
    setActionLoading(challengeId);
    try {
      const { error } = await supabase
        .from("challenges")
        .delete()
        .eq("id", challengeId);

      if (error) throw error;
      toast({ title: "Challenge declined" });
      await loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const unwrapProfile = (p: ChallengeProfile | ChallengeProfile[] | undefined): ChallengeProfile | undefined => {
    if (!p) return undefined;
    if (Array.isArray(p)) return p[0];
    return p;
  };

  const getOpponent = (challenge: Challenge) => {
    if (!user) return null;
    if (challenge.challenger_id === user.id) return unwrapProfile(challenge.challenged);
    return unwrapProfile(challenge.challenger);
  };

  const getUserScore = (challenge: Challenge) => {
    if (!user) return 0;
    return challenge.challenger_id === user.id ? challenge.challenger_score : challenge.challenged_score;
  };

  const getOpponentScore = (challenge: Challenge) => {
    if (!user) return 0;
    return challenge.challenger_id === user.id ? challenge.challenged_score : challenge.challenger_score;
  };

  const pendingChallenges = challenges.filter(
    c => c.status === "pending" && c.challenged_id === user?.id
  );
  const sentChallenges = challenges.filter(
    c => c.status === "pending" && c.challenger_id === user?.id
  );
  const activeChallenges = challenges.filter(c => c.status === "active");
  const completedChallenges = challenges.filter(c => c.status === "completed");

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <Swords className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Challenges</h1>
              <p className="text-muted-foreground">Compete head-to-head with friends</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setSelectedFriend(null);
              if (friends.length > 0) {
                setSelectedFriend(friends[0].friend);
              }
              setShowChallengeModal(true);
            }}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
          >
            <Swords className="w-4 h-4 mr-2" />
            New Challenge
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Incoming Challenges */}
            {pendingChallenges.length > 0 && (
              <Card className="border-2 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Incoming Challenges
                    <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400">{pendingChallenges.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingChallenges.map((challenge) => {
                    const opponent = getOpponent(challenge);
                    return (
                      <div key={challenge.id} className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={opponent?.avatar_url || undefined} />
                          <AvatarFallback>{opponent?.full_name?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{opponent?.full_name || "Someone"}</p>
                          <p className="text-xs text-muted-foreground">
                            {challenge.subject} · {challenge.question_count} questions
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptChallenge(challenge.id)}
                            disabled={actionLoading === challenge.id}
                            className="gap-1 bg-green-500 hover:bg-green-600 text-white"
                          >
                            {actionLoading === challenge.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineChallenge(challenge.id)}
                            disabled={actionLoading === challenge.id}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Sent (Waiting) Challenges */}
            {sentChallenges.length > 0 && (
              <Card className="border border-blue-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Waiting for Response
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sentChallenges.map((challenge) => {
                    const opponent = getOpponent(challenge);
                    return (
                      <div key={challenge.id} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={opponent?.avatar_url || undefined} />
                          <AvatarFallback>{opponent?.full_name?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{opponent?.full_name || "Someone"}</p>
                          <p className="text-xs text-muted-foreground">
                            {challenge.subject} · {challenge.question_count} questions
                          </p>
                        </div>
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Clock className="w-3 h-3" /> Pending
                        </Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Active Challenges */}
            {activeChallenges.length > 0 && (
              <Card className="border-2 border-green-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Play className="w-5 h-5 text-green-500" />
                    Active Challenges
                  </CardTitle>
                  <CardDescription>Complete the quiz to submit your score</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeChallenges.map((challenge) => {
                    const opponent = getOpponent(challenge);
                    return (
                      <div key={challenge.id} className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={opponent?.avatar_url || undefined} />
                          <AvatarFallback>{opponent?.full_name?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{opponent?.full_name || "Someone"}</p>
                          <p className="text-xs text-muted-foreground">
                            {challenge.subject} · {challenge.question_count} questions
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs font-medium">
                              You: {getUserScore(challenge)}/{challenge.question_count}
                            </span>
                            <span className="text-xs text-muted-foreground">vs</span>
                            <span className="text-xs font-medium">
                              {opponent?.full_name?.split(" ")[0]}: {getOpponentScore(challenge)}/{challenge.question_count}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/premium/unlimited-quizzes?challenge=${challenge.id}&subject=${encodeURIComponent(challenge.subject)}`)}
                          className="gap-1 bg-green-500 hover:bg-green-600 text-white"
                        >
                          <Play className="w-3 h-3" />
                          Play
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Completed Challenges */}
            {completedChallenges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {completedChallenges.map((challenge) => {
                    const opponent = getOpponent(challenge);
                    const userScore = getUserScore(challenge);
                    const opScore = getOpponentScore(challenge);
                    const won = userScore > opScore;
                    const tied = userScore === opScore;

                    return (
                      <div key={challenge.id} className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={opponent?.avatar_url || undefined} />
                          <AvatarFallback>{opponent?.full_name?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{opponent?.full_name || "Someone"}</p>
                          <p className="text-xs text-muted-foreground">{challenge.subject}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{userScore}</span>
                            <span className="text-xs text-muted-foreground">vs</span>
                            <span className="font-bold text-lg">{opScore}</span>
                          </div>
                          <Badge
                            variant="secondary"
                            className={
                              won
                                ? "bg-green-500/20 text-green-600 dark:text-green-400"
                                : tied
                                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                                  : "bg-red-500/20 text-red-600 dark:text-red-400"
                            }
                          >
                            {won && <Crown className="w-3 h-3 mr-1" />}
                            {won ? "Won" : tied ? "Tied" : "Lost"}
                            {won && " +25 XP"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Empty state */}
            {challenges.length === 0 && (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-red-500/10">
                    <Swords className="w-12 h-12 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold">No Challenges Yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Challenge your friends to a quiz battle! Pick a subject and compete head-to-head.
                  </p>
                  <div className="flex gap-3 mt-2">
                    <Button variant="outline" onClick={() => navigate("/friends")}>
                      Add Friends First
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      <ChallengeModal
        open={showChallengeModal}
        onOpenChange={setShowChallengeModal}
        friend={selectedFriend}
        onChallengeCreated={loadData}
      />
    </AppLayout>
  );
}
