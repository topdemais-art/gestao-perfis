'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserSession, canAccessRoute } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Edit, CheckCircle, Loader2 } from 'lucide-react'

interface Cliente {
  id: string
  nome: string
  telefone: string
  cidade: string
  etapa_atual: string
  detalhes_tecnicos?: string
  status_obra?: string
  created_at: string
}

export default function ObrasPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [statusObra, setStatusObra] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const user = getUserSession()
    if (!user) {
      router.push('/login')
      return
    }

    if (!canAccessRoute(user.perfil, '/obras')) {
      router.push('/login')
      return
    }

    loadClientes()
  }, [router])

  const loadClientes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('etapa_atual', 'obras')
        .order('created_at', { ascending: false })

      if (error) throw error

      setClientes(data || [])
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os clientes',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setStatusObra(cliente.status_obra || '')
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCliente) return

    try {
      setSubmitting(true)
      const { error } = await supabase
        .from('clientes')
        .update({ status_obra: statusObra })
        .eq('id', selectedCliente.id)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Status da obra atualizado com sucesso'
      })

      setIsDialogOpen(false)
      setSelectedCliente(null)
      setStatusObra('')
      loadClientes()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const finalizarProjeto = async (clienteId: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ etapa_atual: 'concluido' })
        .eq('id', clienteId)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Projeto finalizado com sucesso'
      })

      loadClientes()
    } catch (error) {
      console.error('Erro ao finalizar projeto:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível finalizar o projeto',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) {
      return <Badge variant="outline">Não definido</Badge>
    }

    const statusColors: Record<string, string> = {
      'em_andamento': 'bg-blue-500',
      'aguardando_material': 'bg-yellow-500',
      'pausada': 'bg-orange-500',
      'finalizada': 'bg-green-500'
    }

    const statusLabels: Record<string, string> = {
      'em_andamento': 'Em Andamento',
      'aguardando_material': 'Aguardando Material',
      'pausada': 'Pausada',
      'finalizada': 'Finalizada'
    }

    return (
      <Badge className={statusColors[status] || 'bg-gray-500'}>
        {statusLabels[status] || status}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-100 lg:pl-64">
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Obras</h1>
            <p className="text-gray-600 mt-2">Acompanhe o andamento das obras em execução</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Obras em Andamento</CardTitle>
              <CardDescription>
                Lista de projetos em fase de execução
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                </div>
              ) : clientes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma obra em andamento
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Detalhes Técnicos</TableHead>
                      <TableHead>Status da Obra</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientes.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.nome}</TableCell>
                        <TableCell>{cliente.cidade}</TableCell>
                        <TableCell>
                          {cliente.detalhes_tecnicos ? (
                            <span className="text-sm text-gray-600 line-clamp-2">
                              {cliente.detalhes_tecnicos}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400 italic">
                              Não informado
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(cliente.status_obra)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(cliente)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Atualizar Status
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => finalizarProjeto(cliente.id)}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Finalizar Projeto
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Atualizar Status da Obra</DialogTitle>
                <DialogDescription>
                  {selectedCliente?.nome} - {selectedCliente?.cidade}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="status">Status da Obra</Label>
                  <select
                    id="status"
                    value={statusObra}
                    onChange={(e) => setStatusObra(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Selecione um status</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="aguardando_material">Aguardando Material</option>
                    <option value="pausada">Pausada</option>
                    <option value="finalizada">Finalizada</option>
                  </select>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Status'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
