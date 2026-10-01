// Itens da agenda mensal: procedimentos e checkpoints por dia, com o estado de cada um.

import { PESO_NIVEL } from '../config/regras-alerta'
import { AGORA } from '../data/episodios'
import type { Checkpoint, Episodio, NivelAlerta, StatusAlerta, TipoProcedimento } from '../types'
import { IMAGEM_INSUFICIENTE } from '../components/rotulos'

export type EstadoItem =
  | 'procedimento'
  | 'alerta'
  | 'respondido'
  | 'sem_resposta'
  | 'imagem_insuficiente'
  | 'aguardando'
  | 'agendado'

export interface ItemAgenda {
  id: string
  episodio: Episodio
  checkpoint?: Checkpoint
  quando: string
  estado: EstadoItem
  nivel: NivelAlerta
  rotulo: string // ex.: D1, Procedimento
  descricao: string
}

export interface FiltrosAgenda {
  procedimento: TipoProcedimento | 'todos'
  nivel: NivelAlerta | 'todos'
  status: StatusAlerta | 'sem_alerta' | 'todos'
}

export const FILTROS_PADRAO: FiltrosAgenda = { procedimento: 'todos', nivel: 'todos', status: 'todos' }

export function chaveDia(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${dia}`
}

function nivelDoCheckpoint(ep: Episodio, cp: Checkpoint): NivelAlerta {
  const motivos = ep.alerta?.motivos.filter((m) => m.checkpointRotulo === cp.rotulo) ?? []
  return motivos.reduce<NivelAlerta>((acc, m) => (PESO_NIVEL[m.nivel] > PESO_NIVEL[acc] ? m.nivel : acc), 'verde')
}

function itemCheckpoint(ep: Episodio, cp: Checkpoint): ItemAgenda {
  const nivel = nivelDoCheckpoint(ep, cp)
  const base = { id: cp.id, episodio: ep, checkpoint: cp, quando: cp.previstoPara, rotulo: cp.rotulo, nivel }
  const motivo = ep.alerta?.motivos.find((m) => m.checkpointRotulo === cp.rotulo)

  if (cp.status === 'aguardando_foto' && !cp.fotos.some((f) => f.qualidade === 'aprovada')) {
    return { ...base, estado: 'imagem_insuficiente', descricao: IMAGEM_INSUFICIENTE }
  }
  if (cp.status === 'sem_resposta') return { ...base, estado: 'sem_resposta', descricao: 'Sem resposta no prazo' }
  if (cp.status === 'pendente') {
    const futuro = new Date(cp.previstoPara).getTime() > AGORA.getTime()
    return futuro
      ? { ...base, estado: 'agendado', descricao: 'Checkpoint agendado' }
      : { ...base, estado: 'aguardando', descricao: 'Aguardando resposta' }
  }
  if (motivo) return { ...base, estado: 'alerta', descricao: motivo.dado }
  return { ...base, estado: 'respondido', descricao: 'Respondido, nenhuma regra acionada' }
}

export function filtrarEpisodios(eps: Episodio[], f: FiltrosAgenda): Episodio[] {
  return eps.filter((ep) => {
    if (f.procedimento !== 'todos' && ep.procedimento.tipo !== f.procedimento) return false
    if (f.nivel !== 'todos' && ep.nivel !== f.nivel) return false
    if (f.status === 'sem_alerta' && ep.alerta) return false
    if (f.status !== 'todos' && f.status !== 'sem_alerta' && ep.alerta?.status !== f.status) return false
    return true
  })
}

const ORDEM_ESTADO: Record<EstadoItem, number> = {
  alerta: 0,
  imagem_insuficiente: 1,
  sem_resposta: 2,
  aguardando: 3,
  procedimento: 4,
  respondido: 5,
  agendado: 6,
}

export function ordenarItens(itens: ItemAgenda[]): ItemAgenda[] {
  return [...itens].sort(
    (a, b) =>
      PESO_NIVEL[b.nivel] - PESO_NIVEL[a.nivel] ||
      ORDEM_ESTADO[a.estado] - ORDEM_ESTADO[b.estado] ||
      a.quando.localeCompare(b.quando),
  )
}

// Agrupa itens por dia (chave yyyy-mm-dd no fuso local).
export function itensPorDia(eps: Episodio[]): Map<string, ItemAgenda[]> {
  const mapa = new Map<string, ItemAgenda[]>()
  const adicionar = (item: ItemAgenda) => {
    const k = chaveDia(new Date(item.quando))
    mapa.set(k, [...(mapa.get(k) ?? []), item])
  }
  for (const ep of eps) {
    adicionar({
      id: ep.procedimento.id,
      episodio: ep,
      quando: ep.procedimento.dataHora,
      estado: 'procedimento',
      nivel: 'verde',
      rotulo: 'Procedimento',
      descricao: 'Procedimento realizado',
    })
    ep.checkpoints.forEach((cp) => adicionar(itemCheckpoint(ep, cp)))
  }
  for (const [k, v] of mapa) mapa.set(k, ordenarItens(v))
  return mapa
}

// Pacientes em acompanhamento no dia: entre o procedimento e o último checkpoint previsto.
export function emAcompanhamentoNoDia(eps: Episodio[], dia: Date): number {
  const inicio = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate()).getTime()
  const fim = inicio + 86_400_000
  return eps.filter((ep) => {
    const proc = new Date(ep.procedimento.dataHora).getTime()
    const ultimo = ep.checkpoints[ep.checkpoints.length - 1]
    const termino = ultimo ? new Date(ultimo.previstoPara).getTime() : proc
    return proc < fim && termino >= inicio
  }).length
}

// Alertas cujo primeiro sinal ocorreu no dia.
export function alertasNoDia(eps: Episodio[], k: string): Episodio[] {
  return eps.filter((ep) => ep.alerta && chaveDia(new Date(ep.alerta.primeiroSinalEm)) === k)
}

// Semanas do mês, começando na segunda-feira.
export function semanasDoMes(ano: number, mes: number): Date[][] {
  const primeiro = new Date(ano, mes, 1)
  const deslocamento = (primeiro.getDay() + 6) % 7
  const inicio = new Date(ano, mes, 1 - deslocamento)
  const semanas: Date[][] = []
  for (let s = 0; s < 6; s++) {
    const semana = Array.from({ length: 7 }, (_, d) => new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + s * 7 + d))
    if (s > 3 && semana[0].getMonth() !== mes) break
    semanas.push(semana)
  }
  return semanas
}
