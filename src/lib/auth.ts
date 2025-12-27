import { supabase, User } from './supabase'

export async function loginUser(email: string, senha: string): Promise<User | null> {
  try {
    console.log('🔍 Tentando login com:', { email, senha })
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('senha', senha)
      .single()

    console.log('📦 Resposta do Supabase:', { data, error })
    
    if (error) {
      console.error('❌ Erro do Supabase:', error)
      return null
    }
    
    if (!data) {
      console.warn('⚠️ Nenhum usuário encontrado com essas credenciais')
      return null
    }

    console.log('✅ Usuário encontrado:', data)
    return data as User
  } catch (error) {
    console.error('💥 Erro no login:', error)
    return null
  }
}

export function setUserSession(user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user))
  }
}

export function getUserSession(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      return JSON.parse(userStr) as User
    }
  }
  return null
}

export function clearUserSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
  }
}

export function getRedirectPath(perfil: User['perfil']): string {
  switch (perfil) {
    case 'vendedor':
      return '/vendas'
    case 'tecnico':
      return '/tecnico'
    case 'obra':
      return '/obras'
    case 'admin':
      return '/vendas'
    default:
      return '/login'
  }
}

export function canAccessRoute(userPerfil: User['perfil'], route: string): boolean {
  const routePermissions: Record<string, User['perfil'][]> = {
    '/vendas': ['vendedor', 'admin'],
    '/tecnico': ['tecnico', 'admin'],
    '/obras': ['obra', 'admin']
  }

  const allowedPerfis = routePermissions[route]
  if (!allowedPerfis) return true
  
  return allowedPerfis.includes(userPerfil)
}
