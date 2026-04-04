import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  acceptFriendRequest,
  getFriends,
  getPendingRequests,
  rejectFriendRequest,
  removeFriend,
  searchUsers,
  sendFriendRequest,
  type FriendProfile,
  type Friendship,
} from "@/lib/friends";
import { cn } from "@/lib/utils";
import {
  Check,
  Clock,
  Flame,
  Loader2,
  Search,
  Swords,
  Trophy,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Friends() {
  const { supabase, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [friends, setFriends] = useState<(Friendship & { friend: FriendProfile })[]>([]);
  const [pendingRequests, setPendingRequests] = useState<(Friendship & { friend: FriendProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load friends and pending requests
  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [friendsData, pendingData] = await Promise.all([
        getFriends(supabase, user.id),
        getPendingRequests(supabase, user.id),
      ]);
      setFriends(friendsData);
      setPendingRequests(pendingData);
    } catch (error) {
      console.error("Error loading friends data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search users with debounce
  useEffect(() => {
    if (!user || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await searchUsers(supabase, searchQuery, user.id);
      setSearchResults(results);
      setSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  const handleSendRequest = async (toUserId: string) => {
    if (!user) return;
    setActionLoading(toUserId);
    const result = await sendFriendRequest(supabase, user.id, toUserId);

    if (result.success) {
      toast({ title: "Friend request sent! 🎉", description: "They'll see your request on their Friends page." });
      setSearchResults(prev => prev.filter(u => u.id !== toUserId));
    } else {
      toast({ title: "Couldn't send request", description: result.error, variant: "destructive" });
    }
    setActionLoading(null);
  };

  const handleAccept = async (friendshipId: string) => {
    setActionLoading(friendshipId);
    const result = await acceptFriendRequest(supabase, friendshipId);
    if (result.success) {
      toast({ title: "Friend added! 🤝" });
      await loadData();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setActionLoading(null);
  };

  const handleReject = async (friendshipId: string) => {
    setActionLoading(friendshipId);
    const result = await rejectFriendRequest(supabase, friendshipId);
    if (result.success) {
      toast({ title: "Request declined" });
      await loadData();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setActionLoading(null);
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    if (!confirm("Remove this friend?")) return;
    setActionLoading(friendshipId);
    const result = await removeFriend(supabase, friendshipId);
    if (result.success) {
      toast({ title: "Friend removed" });
      await loadData();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setActionLoading(null);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Friends</h1>
            <p className="text-muted-foreground">Connect with classmates and challenge each other</p>
          </div>
        </div>

        {/* Search */}
        <Card className="border-2 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="w-5 h-5 text-blue-500" />
              Find Friends
            </CardTitle>
            <CardDescription>Search by name or email to add friends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((result) => {
                  const alreadyFriend = friends.some(f => f.friend.id === result.id);
                  return (
                    <div
                      key={result.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted/80 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={result.avatar_url || undefined} />
                        <AvatarFallback>{result.full_name?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{result.full_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" />{result.xp} XP</span>
                          {result.streak > 0 && (
                            <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" />{result.streak}d streak</span>
                          )}
                        </p>
                      </div>
                      {alreadyFriend ? (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <UserCheck className="w-3 h-3" /> Friends
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleSendRequest(result.id)}
                          disabled={actionLoading === result.id}
                          className="gap-1 bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          {actionLoading === result.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserPlus className="w-3 h-3" />
                          )}
                          Add
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground text-center mt-4 py-4">
                No users found matching "{searchQuery}"
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card className="border-2 border-amber-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-amber-500" />
                Pending Requests
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  {pendingRequests.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={request.friend.avatar_url || undefined} />
                    <AvatarFallback>{request.friend.full_name?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{request.friend.full_name}</p>
                    <p className="text-xs text-muted-foreground">wants to be your friend</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAccept(request.id)}
                      disabled={actionLoading === request.id}
                      className="gap-1 bg-green-500 hover:bg-green-600 text-white"
                    >
                      {actionLoading === request.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(request.id)}
                      disabled={actionLoading === request.id}
                      className="gap-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Friends List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCheck className="w-5 h-5 text-green-500" />
              Your Friends
              {friends.length > 0 && (
                <Badge variant="secondary">{friends.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">No friends yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use the search above to find and add friends!
                </p>
              </div>
            ) : (
              <>
                {/* Duolingo-style XP Competition Widget */}
                <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-cyan-500/10 border border-violet-500/20">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Friend Rankings
                  </h3>
                  <div className="space-y-2">
                    {[...friends]
                      .sort((a, b) => (b.friend.xp || 0) - (a.friend.xp || 0))
                      .slice(0, 5)
                      .map((friendship, idx) => (
                        <div
                          key={friendship.id}
                          className="flex items-center gap-3 py-1.5"
                        >
                          <span className={cn(
                            "w-5 text-xs font-bold text-center",
                            idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-amber-600" : "text-muted-foreground"
                          )}>
                            {idx + 1}
                          </span>
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={friendship.friend.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">{friendship.friend.full_name?.[0] || "?"}</AvatarFallback>
                          </Avatar>
                          <span className="flex-1 text-sm font-medium truncate">{friendship.friend.full_name}</span>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1 text-amber-500 font-semibold">
                              <Zap className="w-3 h-3" />
                              {(friendship.friend.xp || 0).toLocaleString()}
                            </span>
                            {friendship.friend.streak > 0 && (
                              <span className="flex items-center gap-1 text-orange-400">
                                <Flame className="w-3 h-3" />
                                {friendship.friend.streak}d
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Friends list */}
                <div className="space-y-2">

                {friends.map((friendship) => (
                  <div
                    key={friendship.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50 group"
                  >
                    <Avatar className="h-10 w-10 border-2 border-primary/10">
                      <AvatarImage src={friendship.friend.avatar_url || undefined} />
                      <AvatarFallback>{friendship.friend.full_name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{friendship.friend.full_name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-500" />
                          {friendship.friend.xp.toLocaleString()} XP
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-orange-500" />
                          {friendship.friend.study_hours}h studied
                        </span>
                        {friendship.friend.streak > 0 && (
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-400" />
                            {friendship.friend.streak}d streak
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/challenges?friend=${friendship.friend.id}`)}
                        className="gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Swords className="w-3 h-3" />
                        Challenge
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveFriend(friendship.id)}
                        disabled={actionLoading === friendship.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        {actionLoading === friendship.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <UserMinus className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
