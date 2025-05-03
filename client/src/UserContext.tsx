import { createContext, useContext, ReactNode } from 'react';
import { User } from '@shared/schema';

// Create a context for the user
interface UserContextType {
  user: User;
}

export const UserContext = createContext<UserContextType | null>(null);

// Provider component
export function UserProvider({ user, children }: { user: User; children: ReactNode }) {
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook to use the user context
export function useUser() {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context.user;
}