import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://njwzywbtekaghhxrsdce.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qd3p5d2J0ZWthZ2hoeHJzZGNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MDIwMDAsImV4cCI6MjA4MjM3ODAwMH0.u7EH6xRyqbfofFn9MujyQxciGc7gxjl4Oa3GT5Kkdas'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface User {
  id: string
  email: string
  senha: string
  perfil: 'vendedor' | 'tecnico' | 'obra' | 'admin'
  nome?: string
  created_at?: string
}

export interface Cliente {
  id: string
  nome: string
  email?: string
  telefone?: string
  cidade?: string
  etapa_atual: 'vendas' | 'tecnico' | 'obras' | 'concluido'
  detalhes_tecnicos?: string
  status_obra?: string
  vendedor_id?: string
  created_at?: string
  updated_at?: string
}
