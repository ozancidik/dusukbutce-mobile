import { create } from 'zustand';
import { authRepository, RegisterInput } from '../api/authRepository';
import { secureStorage } from '../../../core/storage/secureStorage';
import { setUnauthorizedHandler } from '../../../core/network/apiClient';
import { AppUser } from '../../../shared/models/AppUser';

interface AuthState {
  user: AppUser | null;
  isInitializing: boolean;
  isLoggedIn: boolean;
  restoreSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  forceLogout: () => void;
  setUser: (user: AppUser) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isInitializing: true,
  isLoggedIn: false,

  restoreSession: async () => {
    try {
      const token = await secureStorage.readToken();
      if (!token) {
        set({ isInitializing: false });
        return;
      }
      const user = await authRepository.fetchCurrentUser(token);
      if (!user) {
        await secureStorage.deleteToken();
        set({ isInitializing: false, user: null, isLoggedIn: false });
        return;
      }
      set({ user, isLoggedIn: true, isInitializing: false });
    } catch {
      set({ isInitializing: false, user: null, isLoggedIn: false });
    }
  },

  login: async (email, password) => {
    const user = await authRepository.login(email, password);
    set({ user, isLoggedIn: true });
  },

  register: async (input) => {
    await authRepository.register(input);
  },

  forgotPassword: async (email) => {
    await authRepository.forgotPassword(email);
  },

  logout: async () => {
    await authRepository.logout();
    set({ user: null, isLoggedIn: false });
  },

  forceLogout: () => {
    set({ user: null, isLoggedIn: false });
  },

  setUser: (user) => {
    set({ user });
  },
}));

// apiClient, 401 aldığında (login/register hariç) bu handler'ı çağırıyor —
// döngüsel import olmadan store'u apiClient'a "kaydediyoruz".
setUnauthorizedHandler(() => useAuthStore.getState().forceLogout());
