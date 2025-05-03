import { ReactNode } from "react";

// App wrapper component that can be used for global layouts/providers
function App({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default App;