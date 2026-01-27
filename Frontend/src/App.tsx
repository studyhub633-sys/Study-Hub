import { LanguagePermissionModal } from "@/components/LanguagePermissionModal";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Lazy-loaded components
const Admin = lazy(() => import("./pages/Admin"));
const AITutor = lazy(() => import("./pages/AITutor"));
const Extracurricular = lazy(() => import("./pages/Extracurricular"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Flashcards = lazy(() => import("./pages/Flashcards"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const GlobalLibrary = lazy(() => import("./pages/GlobalLibrary"));
const Index = lazy(() => import("./pages/Index"));
const Knowledge = lazy(() => import("./pages/Knowledge"));
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Notes = lazy(() => import("./pages/Notes"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PastPapers = lazy(() => import("./pages/PastPapers"));
// const Premium = lazy(() => import("./pages/Premium"));
const FocusMode = lazy(() => import("./pages/premium/FocusMode"));
const HomeworkSolver = lazy(() => import("./pages/premium/HomeworkSolver"));
const HomeworkTracker = lazy(() => import("./pages/premium/HomeworkTracker"));
const Leaderboard = lazy(() => import("./pages/premium/Leaderboard"));
const NoteCondenser = lazy(() => import("./pages/premium/NoteCondenser"));
const PredictedGrades = lazy(() => import("./pages/premium/PredictedGrades"));
const PredictedPapers = lazy(() => import("./pages/premium/PredictedPapers"));
const StudyPlans = lazy(() => import("./pages/premium/StudyPlans"));
const VirtualSessions = lazy(() => import("./pages/premium/VirtualSessions"));
const WorkExperience = lazy(() => import("./pages/premium/WorkExperience"));
const MindMapGenerator = lazy(() => import("./pages/premium/MindMapGenerator"));
const AIExaminer = lazy(() => import("./pages/premium/AIExaminer"));
const PerformanceHeatMap = lazy(() => import("./pages/premium/PerformanceHeatMap"));
const Grade9Notes = lazy(() => import("./pages/premium/Grade9Notes"));
const PremiumDashboard = lazy(() => import("./pages/PremiumDashboard"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Returns = lazy(() => import("./pages/Returns"));
const Settings = lazy(() => import("./pages/Settings"));
const Signup = lazy(() => import("./pages/Signup"));
const Terms = lazy(() => import("./pages/Terms"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground font-medium animate-pulse">Loading Scientia.ai...</p>
    </div>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <LanguagePermissionModal />
            <AuthProvider>
              <BrowserRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/landing" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/returns" element={<Returns />} />
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Index />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/notes"
                      element={
                        <ProtectedRoute>
                          <Notes />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/flashcards"
                      element={
                        <ProtectedRoute>
                          <Flashcards />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/past-papers"
                      element={
                        <ProtectedRoute>
                          <PastPapers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/knowledge"
                      element={
                        <ProtectedRoute>
                          <Knowledge />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/extracurricular"
                      element={
                        <ProtectedRoute>
                          <Extracurricular />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/ai-tutor"
                      element={
                        <ProtectedRoute>
                          <AITutor />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/premium"
                      element={<Navigate to="/premium-dashboard" replace />}
                    />
                    <Route
                      path="/premium-dashboard"
                      element={
                        <ProtectedRoute>
                          <PremiumDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/premium/homework-solver"
                      element={
                        <ProtectedRoute>
                          <HomeworkSolver />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/premium/note-condenser"
                      element={
                        <ProtectedRoute>
                          <NoteCondenser />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/premium/homework-tracker"
                      element={
                        <ProtectedRoute>
                          <HomeworkTracker />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/premium/study-plans"
                      element={
                        <ProtectedRoute>
                          <StudyPlans />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/premium/predicted-grades"
                      element={
                        <ProtectedRoute>
                          <PredictedGrades />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/premium/focus-mode"
                      element={
                        <ProtectedRoute>
                          <FocusMode />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/premium/leaderboard"
                      element={
                        <ProtectedRoute>
                          <Leaderboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/premium/virtual-sessions"
                      element={
                        <ProtectedRoute>
                          <VirtualSessions />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/premium/predicted-papers"
                      element={
                        <ProtectedRoute>
                          <PredictedPapers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/premium/work-experience"
                      element={
                        <ProtectedRoute>
                          <WorkExperience />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/premium/mind-map-generator"
                      element={
                        <ProtectedRoute>
                          <MindMapGenerator />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/premium/ai-examiner"
                      element={
                        <ProtectedRoute>
                          <AIExaminer />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/premium/performance-heatmap"
                      element={
                        <ProtectedRoute>
                          <PerformanceHeatMap />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/premium/grade-9-notes"
                      element={
                        <ProtectedRoute>
                          <Grade9Notes />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/library"
                      element={
                        <ProtectedRoute>
                          <GlobalLibrary />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </AuthProvider>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
