import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Users,
  DollarSign,
  TrendingUp,
  Search,
  Crown,
  UserX,
  UserCheck,
  Loader2,
  Eye,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { isAdmin } from "@/lib/premium";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface User {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  is_premium: boolean;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export default function Admin() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user || !supabase) {
      navigate("/");
      return;
    }

    const admin = await isAdmin(supabase, user.id);
    setIsUserAdmin(admin);

    if (!admin) {
      toast.error("Admin access required");
      navigate("/");
      return;
    }

    loadData();
  };

  const loadData = async () => {
    if (!user || !supabase) return;

    setLoading(true);
    try {
      await Promise.all([loadUsers(), loadStats()]);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    if (!user || !supabase) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${API_BASE_URL}/api/admin/users?page=${page}&limit=20&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        toast.error(data.error || "Failed to load users");
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    }
  };

  const loadStats = async () => {
    if (!user || !supabase) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadUserDetails = async (userId: string) => {
    if (!user || !supabase) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUserDetails(data);
      } else {
        toast.error(data.error || "Failed to load user details");
      }
    } catch (error) {
      console.error("Error loading user details:", error);
      toast.error("Failed to load user details");
    }
  };

  const updatePremium = async (userId: string, isPremium: boolean) => {
    if (!user || !supabase) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/premium`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ is_premium: isPremium }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || `Premium access ${isPremium ? "granted" : "revoked"}`);
        loadUsers();
        loadStats();
        if (selectedUser?.id === userId) {
          loadUserDetails(userId);
        }
      } else {
        toast.error(data.error || "Failed to update premium status");
      }
    } catch (error) {
      console.error("Error updating premium:", error);
      toast.error("Failed to update premium status");
    }
  };

  const updateAdmin = async (userId: string, isAdmin: boolean) => {
    if (!user || !supabase) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/admin`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ is_admin: isAdmin }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || `Admin access ${isAdmin ? "granted" : "revoked"}`);
        loadUsers();
        if (selectedUser?.id === userId) {
          loadUserDetails(userId);
        }
      } else {
        toast.error(data.error || "Failed to update admin status");
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      toast.error("Failed to update admin status");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    if (!user || !supabase) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("User deleted successfully");
        loadUsers();
        loadStats();
        setSelectedUser(null);
        setUserDetails(null);
      } else {
        toast.error(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  useEffect(() => {
    if (isUserAdmin) {
      loadUsers();
    }
  }, [page, searchQuery, isUserAdmin]);

  if (!isUserAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (loading && !stats) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-8 w-8 text-premium" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Manage users, subscriptions, and payments</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Total Users</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5 text-premium" />
                <span className="text-sm text-muted-foreground">Premium Users</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.premiumUsers}</p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-secondary" />
                <span className="text-sm text-muted-foreground">Active Subs</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.activeSubscriptions}</p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-accent" />
                <span className="text-sm text-muted-foreground">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold text-foreground">£{stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-secondary" />
                <span className="text-sm text-muted-foreground">Monthly Revenue</span>
              </div>
              <p className="text-2xl font-bold text-foreground">£{stats.monthlyRevenue.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Users</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.full_name || "—"}</TableCell>
                    <TableCell>
                      {user.is_premium ? (
                        <span className="inline-flex items-center gap-1 text-premium">
                          <Crown className="h-4 w-4" />
                          Premium
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Free</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <span className="inline-flex items-center gap-1 text-premium">
                          <Shield className="h-4 w-4" />
                          Admin
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                loadUserDetails(user.id);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                              <DialogDescription>
                                Manage user account and permissions
                              </DialogDescription>
                            </DialogHeader>
                            {userDetails && (
                              <div className="space-y-4">
                                <div>
                                  <h3 className="font-semibold mb-2">Profile</h3>
                                  <div className="space-y-2 text-sm">
                                    <p><span className="text-muted-foreground">Email:</span> {userDetails.profile.email}</p>
                                    <p><span className="text-muted-foreground">Name:</span> {userDetails.profile.full_name || "—"}</p>
                                    <p><span className="text-muted-foreground">Joined:</span> {new Date(userDetails.profile.created_at).toLocaleString()}</p>
                                  </div>
                                </div>

                                <div>
                                  <h3 className="font-semibold mb-2">Permissions</h3>
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">Premium:</span>
                                      <Button
                                        variant={userDetails.profile.is_premium ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => updatePremium(user.id, !userDetails.profile.is_premium)}
                                      >
                                        {userDetails.profile.is_premium ? (
                                          <>
                                            <UserCheck className="h-4 w-4 mr-1" />
                                            Revoke
                                          </>
                                        ) : (
                                          <>
                                            <Crown className="h-4 w-4 mr-1" />
                                            Grant
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">Admin:</span>
                                      <Button
                                        variant={userDetails.profile.is_admin ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => updateAdmin(user.id, !userDetails.profile.is_admin)}
                                      >
                                        {userDetails.profile.is_admin ? (
                                          <>
                                            <Shield className="h-4 w-4 mr-1" />
                                            Revoke
                                          </>
                                        ) : (
                                          <>
                                            <Shield className="h-4 w-4 mr-1" />
                                            Grant
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {userDetails.subscription && (
                                  <div>
                                    <h3 className="font-semibold mb-2">Subscription</h3>
                                    <div className="space-y-2 text-sm">
                                      <p><span className="text-muted-foreground">Plan:</span> {userDetails.subscription.plan_type}</p>
                                      <p><span className="text-muted-foreground">Status:</span> {userDetails.subscription.status}</p>
                                      <p><span className="text-muted-foreground">Period End:</span> {new Date(userDetails.subscription.current_period_end).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                )}

                                <div className="pt-4 border-t">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteUser(user.id)}
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Delete User
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

