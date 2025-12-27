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
import { useToast } from '@/hooks/use-toast'
import { Plus, Send, Loader2 } from 'lucide-react'

interface Cliente {
  id: string
  nome: string
  telefone: string
  cidade: string
  etapa_atual: string
  created_at: string
}

export default function VendasPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    cidade: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const user = getUserSession()
    if (!user) {
      router.push('/login')
      return
    }

    if (!canAccessRoute(user.perfil, '/vendas')) {
      router.push('/login')
      return
    }

    loadClientes()
  }, [router])

  const loadClientes = async () => {
    try {
      setLoading(true)
      
      console.log('🔍 INICIANDO BUSCA DE CLIENTES')
      console.log('📋 Tabela: clientes')
      console.log('🔧 Filtro: REMOVIDO TEMPORARIAMENTE (buscando todos os clientes)')
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('📊 RESULTADO DA BUSCA:')
      console.log('✅ Dados retornados:', data)
      console.log('❌ Erro retornado:', error)
      
      if (error) {
        console.error('🚨 ERRO DETALHADO AO BUSCAR CLIENTES:')
        console.error('Código:', error.code)
        console.error('Mensagem:', error.message)
        console.error('Detalhes:', error.details)
        console.error('Hint:', error.hint)
        console.error('Objeto completo:', JSON.stringify(error, null, 2))
        throw error
      }

      console.log(`✅ Total de clientes encontrados: ${data?.length || 0}`)
      setClientes(data || [])
    } catch (error) {
      console.error('🚨 ERRO CAPTURADO NO CATCH:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os clientes. Veja o console para detalhes.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome || !formData.telefone || !formData.cidade) {
      toast({
        title: 'Atenção',
        description: 'Preencha todos os campos',
        variant: 'destructive'
      })
      return
    }

    try {
      setSubmitting(true)
      
      // Dados que serão enviados
      const dadosParaEnviar = {
        nome: formData.nome,
        telefone: formData.telefone,
        cidade: formData.cidade,
        etapa_atual: 'vendas'
      }
      
      console.log('🔍 INICIANDO CADASTRO DE CLIENTE')
      console.log('📋 Tabela: clientes')
      console.log('📦 Dados enviados:', dadosParaEnviar)
      
      const { data, error } = await supabase
        .from('clientes')
        .insert([dadosParaEnviar])
        .select()

      console.log('📊 RESPOSTA DO SUPABASE:')
      console.log('✅ Dados retornados:', data)
      console.log('❌ Erro retornado:', error)
      
      if (error) {
        console.error('🚨 ERRO DETALHADO DO SUPABASE:')
        console.error('Código:', error.code)
        console.error('Mensagem:', error.message)
        console.error('Detalhes:', error.details)
        console.error('Hint:', error.hint)
        console.error('Objeto completo:', JSON.stringify(error, null, 2))
        throw error
      }

      console.log('✅ CADASTRO REALIZADO COM SUCESSO')
      
      toast({
        title: 'Sucesso',
        description: 'Cliente cadastrado com sucesso'
      })

      setFormData({ nome: '', telefone: '', cidade: '' })
      setIsDialogOpen(false)
      loadClientes()
    } catch (error: any) {
      console.error('🚨 ERRO CAPTURADO NO CATCH:', error)
      
      toast({
        title: 'Erro ao cadastrar',
        description: error?.message || 'Não foi possível cadastrar o cliente. Veja o console para detalhes.',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const enviarParaTecnico = async (clienteId: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ etapa_atual: 'tecnico' })
        .eq('id', clienteId)

      if (error) throw error

      toast({
        title: 'Sucesso',
        description: 'Cliente enviado para o setor técnico'
      })

      loadClientes()
    } catch (error) {
      console.error('Erro ao enviar cliente:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o cliente',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-100 lg:pl-64">
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Módulo de Vendas</h1>
              <p className="text-gray-600 mt-2">Gerencie seus clientes na etapa de vendas</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do cliente para iniciar o processo de vendas
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Nome completo do cliente"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      placeholder="Cidade do cliente"
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
                        Cadastrando...
                      </>
                    ) : (
                      'Cadastrar Cliente'
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Clientes em Vendas</CardTitle>
              <CardDescription>
                Lista de clientes na etapa de vendas (filtro temporariamente removido)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                </div>
              ) : clientes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum cliente encontrado na tabela
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Etapa</TableHead>
                      <TableHead>Data</TableHead>
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
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                            {cliente.etapa_atual}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => enviarParaTecnico(cliente.id)}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Enviar para Técnico
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
