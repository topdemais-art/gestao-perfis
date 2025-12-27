import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login']
  
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Para rotas protegidas, deixamos o cliente verificar a sessão
  // pois localStorage só está disponível no cliente
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
