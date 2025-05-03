import { ReactNode } from "react";
import { Route, Redirect, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  path: string;
  component: () => ReactNode;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  return (
    <Route path={path}>
      {!user ? (
        <Redirect to="/auth" />
      ) : (
        <Component />
      )}
    </Route>
  );
}