import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import Dashboard from "./pages/dashboard";
import AuthPage from "./pages/auth-page";
import TrainingPage from "./pages/training-page";
import ExerciseLog from "./pages/exercise-log";
import ExerciseHistory from "./pages/exercise-history";
import CalendarPage from "./pages/calendar-page";
import NewsPage from "./pages/news-page";
import ProfilePage from "./pages/profile-page";
import ManageAthletes from "./pages/admin/manage-athletes";
import CreateTraining from "./pages/admin/create-training";
import Reports from "./pages/admin/reports";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected routes for all authenticated users */}
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/training" component={TrainingPage} />
      <ProtectedRoute path="/exercise-log" component={ExerciseLog} />
      <ProtectedRoute path="/history" component={ExerciseHistory} />
      <ProtectedRoute path="/calendar" component={CalendarPage} />
      <ProtectedRoute path="/news" component={NewsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      
      {/* Admin only routes */}
      <ProtectedRoute path="/admin/athletes" component={ManageAthletes} roleRequired="coach" />
      <ProtectedRoute path="/admin/training" component={CreateTraining} roleRequired="coach" />
      <ProtectedRoute path="/admin/reports" component={Reports} roleRequired="coach" />

      {/* Public news route */}
      <Route path="/public/news" component={NewsPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
