import { createClient } from "@supabase/supabase-js";

// Variáveis de ambiente - você deve configurar essas no seu arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || "";

// Flag para verificar se está configurado
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Validação das variáveis de ambiente
if (!isSupabaseConfigured) {
  const errorMessage = `
❌ ERRO: Variáveis de ambiente do Supabase não configuradas!

📝 Para corrigir:
1. Crie um arquivo .env na raiz do projeto
2. Adicione as seguintes variáveis:

VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui

💡 Como obter essas credenciais:
1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá em Settings > API
4. Copie a "Project URL" e a "anon/public key"

⚠️ O sistema não funcionará até que essas variáveis sejam configuradas.
  `;

  console.error(errorMessage);

  // Mostrar alerta no navegador apenas uma vez
  if (
    typeof window !== "undefined" &&
    !(window as any).__supabaseConfigWarningShown
  ) {
    console.error(
      "🚨 Supabase não configurado! Verifique o console para instruções."
    );
    (window as any).__supabaseConfigWarningShown = true;
  }
}

// Criar cliente Supabase
// O createClient do Supabase valida automaticamente a URL
// Se as variáveis não estiverem configuradas, ele lançará um erro claro
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
