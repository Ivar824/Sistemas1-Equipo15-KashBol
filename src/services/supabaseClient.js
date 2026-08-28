import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Advertencia: Las variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están configuradas.\n' +
    'Crea un archivo .env en la raíz del proyecto basándote en .env.example para habilitar la persistencia.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
