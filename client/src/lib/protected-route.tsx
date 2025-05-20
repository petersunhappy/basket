import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
  roleRequired?: 'athlete' | 'coach';
}

export function ProtectedRoute({
  path,
  component: Component,
  roleRequired,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // Check if the user is logged in
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If a specific role is required, check if user has that role
  if (roleRequired && user.role !== roleRequired) {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // If we reach here, the user is logged in and has the required role (if any)
  return <Route path={path} component={Component} />;
}
