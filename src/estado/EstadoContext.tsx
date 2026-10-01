// Estado de interação somente em memória. Recarregar a página volta aos dados fictícios originais.

import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react'
import { PROFISSIONAIS } from '../data/cenarios'
import { EPISODIOS } from '../data/episodios'
import type { Episodio, Profissional, StatusAlerta } from '../types'
import { ROTULO_STATUS_ALERTA } from '../components/rotulos'

type Acao =
  | { tipo: 'assumir'; episodioId: string; profissional: Profissional }
  | { tipo: 'mudarStatus'; episodioId: string; status: StatusAlerta; usuario: Profissional }

function registrar(ep: Episodio, usuario: string, acao: string): Episodio {
  const evento = { id: `${ep.id}-aud-${ep.auditoria.length + 1}`, dataHora: new Date().toISOString(), usuario, acao }
  return { ...ep, auditoria: [...ep.auditoria, evento] }
}

function reducer(estado: Episodio[], acao: Acao): Episodio[] {
  return estado.map((ep) => {
    if (ep.id !== acao.episodioId || !ep.alerta) return ep
    if (acao.tipo === 'assumir') {
      const { profissional } = acao
      let novo: Episodio = { ...ep, alerta: { ...ep.alerta, responsavelId: profissional.id } }
      novo = registrar(novo, profissional.nome, `Caso assumido por ${profissional.nome}`)
      if (ep.alerta.status === 'novo') {
        novo = { ...novo, alerta: { ...novo.alerta!, status: 'visualizado' } }
        novo = registrar(novo, profissional.nome, 'Alerta visualizado')
      }
      return novo
    }
    const novo: Episodio = { ...ep, alerta: { ...ep.alerta, status: acao.status } }
    return registrar(novo, acao.usuario.nome, `Status alterado para: ${ROTULO_STATUS_ALERTA[acao.status].toLowerCase()}`)
  })
}

interface ValorContexto {
  episodios: Episodio[]
  usuario: Profissional
  setUsuario: (p: Profissional) => void
  assumir: (episodioId: string) => void
  mudarStatus: (episodioId: string, status: StatusAlerta) => void
  agora: number
}

const Contexto = createContext<ValorContexto | null>(null)

export function ProvedorEstado({ children }: { children: ReactNode }) {
  const [episodios, despachar] = useReducer(reducer, EPISODIOS)
  const [usuario, setUsuario] = useState<Profissional>(PROFISSIONAIS[0])
  const [agora, setAgora] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setAgora(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const valor: ValorContexto = {
    episodios,
    usuario,
    setUsuario,
    assumir: (episodioId) => despachar({ tipo: 'assumir', episodioId, profissional: usuario }),
    mudarStatus: (episodioId, status) => despachar({ tipo: 'mudarStatus', episodioId, status, usuario }),
    agora,
  }
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useEstado(): ValorContexto {
  const v = useContext(Contexto)
  if (!v) throw new Error('useEstado fora do ProvedorEstado')
  return v
}
