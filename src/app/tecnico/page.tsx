'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserSession, canAccessRoute } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Edit, Send, Loader2 } from 'lucide-react'

interface Cliente {
  id: string
  nome: string
  telefone: string
  cidade: string
  etapa_atual: string
  detalhes_tecnicos?: string
  created_at: string
}

export default function TecnicoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [detalhesTecnicos, setDetalhesTecnicos] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const user = getUserSession()
    if (!user) {
      router.push('/login')
      return
    }

    if (!canAccessRoute(user.perfil, '/tecnico')) {
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
        .eq('etapa_atual', 'tecnico')
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
    setDetalhesTecnicos(cliente.detalhes_tecnicos || '')
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCliente) return

    try {
      setSubmitting(true)
      const { error } = await supabase
        .from('clientes')
        .update({ detalhes_tecnicos: detalhesTecnicos })
        .eq('id', selectedCliente.id)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Detalhes técnicos atualizados com sucesso'
      })

      setIsDialogOpen(false)
      setSelectedCliente(null)
      setDetalhesTecnicos('')
      loadClientes()
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar os detalhes',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const liberarParaObra = async (clienteId: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ etapa_atual: 'obras' })
        .eq('id', clienteId)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Cliente liberado para gestão de obras'
      })

      loadClientes()
    } catch (error) {
      console.error('Erro ao liberar cliente:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível liberar o cliente',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-100 lg:pl-64">
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Setor Técnico</h1>
            <p className="text-gray-600 mt-2">Gerencie os detalhes técnicos dos projetos</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Clientes no Setor Técnico</CardTitle>
              <CardDescription>
                Lista de clientes aguardando análise técnica
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                </div>
              ) : clientes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum cliente no setor técnico
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Detalhes Técnicos</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientes.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.nome}</TableCell>
                        <TableCell>{cliente.telefone}</TableCell>
                        <TableCell>{cliente.cidade}</TableCell>
                        <TableCell>
                          {cliente.detalhes_tecnicos ? (
                            <span className="text-sm text-gray-600 line-clamp-2">
                              {cliente.detalhes_tecnicos}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400 italic">
                              Não preenchido
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(cliente)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => liberarParaObra(cliente.id)}
                              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Liberar para Obra
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
                <DialogTitle>Editar Detalhes Técnicos</DialogTitle>
                <DialogDescription>
                  {selectedCliente?.nome} - {selectedCliente?.cidade}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="detalhes">Detalhes Técnicos</Label>
                  <Textarea
                    id="detalhes"
                    value={detalhesTecnicos}
                    onChange={(e) => setDetalhesTecnicos(e.target.value)}
                    placeholder="Ex: Modelo da bomba, data de instalação, especificações técnicas..."
                    rows={6}
                  />
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
                    'Salvar Detalhes'
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
