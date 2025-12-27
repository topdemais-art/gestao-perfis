'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getUserSession, clearUserSession, User } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Waves, 
  Users, 
  Wrench, 
  HardHat, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MenuItem {
  label: string
  icon: React.ReactNode
  path: string
  perfis: User['perfil'][]
}

const menuItems: MenuItem[] = [
  {
    label: 'Vendas',
    icon: <Users className="w-5 h-5" />,
    path: '/vendas',
    perfis: ['vendedor', 'admin']
  },
  {
    label: 'Setor Técnico',
    icon: <Wrench className="w-5 h-5" />,
    path: '/tecnico',
    perfis: ['tecnico', 'admin']
  },
  {
    label: 'Gestão de Obras',
    icon: <HardHat className="w-5 h-5" />,
    path: '/obras',
    perfis: ['obra', 'admin']
  }
]

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const currentUser = getUserSession()
    if (!currentUser && pathname !== '/login') {
      router.push('/login')
    } else {
      setUser(currentUser)
    }
  }, [router, pathname])

  const handleLogout = () => {
    clearUserSession()
    router.push('/login')
  }

  const filteredMenuItems = menuItems.filter(item => 
    user && item.perfis.includes(user.perfil)
  )

  if (!user || pathname === '/login') return null

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white w-64 z-40 transition-transform duration-300 flex flex-col shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Top Demais</h2>
              <p className="text-xs text-slate-400">Piscina</p>
            </div>
          </div>
          
          {/* User Info */}
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-sm font-medium">{user.nome || user.email}</p>
            <p className="text-xs text-cyan-400 capitalize mt-1">
              {user.perfil}
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <Button
                key={item.path}
                onClick={() => {
                  router.push(item.path)
                  setIsOpen(false)
                }}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-12 text-left transition-all",
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:from-cyan-600 hover:to-blue-700"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Button>
            )
          })}
        </nav>

        <Separator className="bg-slate-700" />

        {/* Logout */}
        <div className="p-4">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 h-12 text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </Button>
        </div>
      </aside>
    </>
  )
}
