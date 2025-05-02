import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import AppleStyleLogin from "./AppleStyleLogin";
import { AuthProvider } from "./hooks/use-auth";

function App() {
  // Use our Apple-style login directly as we're fixing the routing issues
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppleStyleLogin />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;