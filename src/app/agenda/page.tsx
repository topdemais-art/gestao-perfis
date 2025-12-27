'use client'

import { useState, useEffect } from 'react'
import { supabase, Cliente } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Calendar, Search, Phone, Mail, MapPin, Loader2, Clock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function AgendaPage() {
  const { toast } = useToast()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('etapa', 'tecnico')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClientes(data || [])
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a agenda',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone?.includes(searchTerm)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 lg:pl-64">
      <div className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agenda Técnica</h1>
              <p className="text-gray-600 mt-1">Clientes aguardando visita técnica</p>
            </div>
            <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">{filteredClientes.length} pendente(s)</span>
            </div>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </CardContent>
          </Card>

          {/* Clientes Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
          ) : filteredClientes.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum cliente na agenda técnica</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClientes.map((cliente) => (
                <Card key={cliente.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                      <Badge className="bg-yellow-500 text-white">
                        Técnico
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {cliente.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-cyan-500" />
                        <span className="truncate">{cliente.email}</span>
                      </div>
                    )}
                    {cliente.telefone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-cyan-500" />
                        <span>{cliente.telefone}</span>
                      </div>
                    )}
                    {cliente.endereco && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-cyan-500 mt-0.5" />
                        <span className="flex-1">{cliente.endereco}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500">
                        Cadastrado em {new Date(cliente.created_at || '').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
