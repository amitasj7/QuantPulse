import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  avatarUrl: string;
}

interface AuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (creds: { emailOrMobile: string; password: string }) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<AdminUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (creds: { emailOrMobile: string; password: string }) => {
        // Mock authentication for QuantPulse Admin
        if (creds.password === 'admin123') {
          const isEmail = creds.emailOrMobile.includes('@');
          const mockUser = {
             id: 'admin-1',
             name: 'Admin Director',
             email: isEmail ? creds.emailOrMobile : 'admin@quantpulse.com',
             mobile: !isEmail ? creds.emailOrMobile : '+1 555-0198',
             avatarUrl: 'https://i.pravatar.cc/150?u=admin-1'
          };
          set({ user: mockUser, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      updateProfile: (updates: Partial<AdminUser>) => set((state) => ({ 
        user: state.user ? { ...state.user, ...updates } : null 
      }))
    }),
    {
      name: 'quantpulse-auth-storage',
    }
  )
);
