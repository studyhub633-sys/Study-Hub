import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Admin from "./pages/Admin";
import AITutor from "./pages/AITutor";
import Extracurricular from "./pages/Extracurricular";
import FAQ from "./pages/FAQ";
import Flashcards from "./pages/Flashcards";
import ForgotPassword from "./pages/ForgotPassword";
import GlobalLibrary from "./pages/GlobalLibrary";
import Index from "./pages/Index";
import Knowledge from "./pages/Knowledge";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Notes from "./pages/Notes";
import NotFound from "./pages/NotFound";
import PastPapers from "./pages/PastPapers";
import Premium from "./pages/Premium";
import FocusMode from "./pages/premium/FocusMode";
import HomeworkSolver from "./pages/premium/HomeworkSolver";
import Leaderboard from "./pages/premium/Leaderboard";
import NoteCondenser from "./pages/premium/NoteCondenser";
import PredictedGrades from "./pages/premium/PredictedGrades";
import VirtualSessions from "./pages/premium/VirtualSessions";
import PremiumDashboard from "./pages/PremiumDashboard";


import ResetPassword from "./pages/ResetPassword";
import Returns from "./pages/Returns";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import Terms from "./pages/Terms";

const queryClient = new QueryClient();

const App = () => {
  // #region agent log
  console.log('[DEBUG] App.tsx:29 - App component rendering');
  fetch('http://127.0.0.1:7242/ingest/668e5ddb-32f9-4036-9a85-0a4ba19db7f5', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'App.tsx:29', message: 'App component rendering', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'frontend-startup', hypothesisId: 'B' }) }).catch(() => { });
  // #endregion

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
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
                  element={
                    <ProtectedRoute>
                      <Premium />
                    </ProtectedRoute>
                  }
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
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
