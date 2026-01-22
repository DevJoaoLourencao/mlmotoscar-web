import { supabase } from "./supabase";

export const authService = {
  login: async (
    email: string,
    password: string
  ): Promise<{ user: any; error: any }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Traduzir e melhorar mensagens de erro
        let errorMessage = error.message;
        
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('invalid_credentials')) {
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada e confirme seu email antes de fazer login.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'Usuário não encontrado. Verifique se o email está correto.';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        }
        
        return { 
          user: null, 
          error: { 
            ...error, 
            message: errorMessage 
          } 
        };
      }

      return { user: data.user, error: null };
    } catch (error: any) {
      return {
        user: null,
        error: { 
          message: error.message || "Erro ao fazer login. Tente novamente mais tarde." 
        },
      };
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  getUser: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },

  getSession: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  },

  isAuthenticated: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return !!session;
  },

  // Listener para mudanças de autenticação
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};
