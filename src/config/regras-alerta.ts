// PLACEHOLDER: requer validação clínica.
// Regras fictícias e determinísticas, criadas apenas para demonstrar o conceito.
// Nenhuma regra aqui representa critério clínico validado. Alertas indicam
// PRIORIDADE DE AVALIAÇÃO, nunca probabilidade diagnóstica.
//
// Como editar: cada regra recebe o contexto de um checkpoint e devolve
// a descrição do dado que a acionou (string) ou null quando não se aplica.

import type { Checkpoint, NivelAlerta, TipoProcedimento } from '../types'

export const STATUS_VALIDACAO = 'PLACEHOLDER: requer validação clínica' as const

export interface ContextoRegra {
  tipo: TipoProcedimento
  checkpoint: Checkpoint
  agora: Date
}

export interface RegraAlerta {
  id: string
  nivel: NivelAlerta
  descricao: string
  validacao: typeof STATUS_VALIDACAO
  avaliar: (ctx: ContextoRegra) => string | null
}

// Limiar fictício para "dor intensa" na escala de 0 a 10.
export const LIMIAR_DOR_INTENSA = 7

export const REGRAS_ALERTA: RegraAlerta[] = [
  {
    id: 'R-VERM-01',
    nivel: 'vermelho',
    descricao: 'Dor intensa ou dor que aumenta após procedimento com preenchedor',
    validacao: STATUS_VALIDACAO,
    avaliar: ({ tipo, checkpoint }) => {
      if (tipo !== 'preenchedor_ah') return null
      const r = checkpoint.respostas
      const partes: string[] = []
      if (r.dor_intensidade !== undefined && r.dor_intensidade >= LIMIAR_DOR_INTENSA) {
        partes.push(`dor relatada ${r.dor_intensidade}/10`)
      }
      if (r.dor_tendencia === 'piorando') partes.push('dor relatada como piorando')
      return partes.length ? partes.join('; ') : null
    },
  },
  {
    id: 'R-VERM-02',
    nivel: 'vermelho',
    descricao: 'Relato de mudança de cor da pele (palidez, manchas arroxeadas ou rendilhadas)',
    validacao: STATUS_VALIDACAO,
    avaliar: ({ checkpoint }) => {
      const cor = checkpoint.respostas.mudanca_cor_pele
      if (!cor || cor === 'nenhuma') return null
      const texto = { palidez: 'palidez', manchas_arroxeadas: 'manchas arroxeadas', rendilhada: 'aspecto rendilhado' }[cor]
      return `paciente relatou ${texto}`
    },
  },
  {
    id: 'R-VERM-03',
    nivel: 'vermelho',
    descricao: 'Relato de alteração visual',
    validacao: STATUS_VALIDACAO,
    avaliar: ({ checkpoint }) =>
      checkpoint.respostas.alteracao_visual === true ? 'paciente relatou alteração na visão' : null,
  },
  {
    id: 'R-LAR-01',
    nivel: 'laranja',
    descricao: 'Inchaço relatado como piorando após D2',
    validacao: STATUS_VALIDACAO,
    avaliar: ({ checkpoint }) =>
      checkpoint.horasApos > 48 && checkpoint.respostas.edema_tendencia === 'piorando'
        ? `inchaço relatado como piorando no ${checkpoint.rotulo}`
        : null,
  },
  {
    id: 'R-AMA-01',
    nivel: 'amarelo',
    descricao: 'Checkpoint sem resposta após o prazo',
    validacao: STATUS_VALIDACAO,
    avaliar: ({ checkpoint, agora }) => {
      if (checkpoint.status === 'sem_resposta') return `sem resposta no ${checkpoint.rotulo}`
      if (checkpoint.status !== 'pendente') return null
      const limite = new Date(checkpoint.previstoPara).getTime() + checkpoint.prazoRespostaHoras * 3600_000
      return agora.getTime() > limite ? `sem resposta no ${checkpoint.rotulo}` : null
    },
  },
  {
    id: 'R-AMA-02',
    nivel: 'amarelo',
    descricao: 'Foto insuficiente em duas tentativas',
    validacao: STATUS_VALIDACAO,
    avaliar: ({ checkpoint }) => {
      const insuficientes = checkpoint.fotos.filter((f) => f.qualidade === 'insuficiente').length
      const aprovada = checkpoint.fotos.some((f) => f.qualidade === 'aprovada')
      return !aprovada && insuficientes >= 2
        ? `${insuficientes} fotos insuficientes no ${checkpoint.rotulo}`
        : null
    },
  },
]

// Ordem de prioridade. Regras vermelhas prevalecem sobre qualquer outra.
export const PESO_NIVEL: Record<NivelAlerta, number> = {
  verde: 0,
  amarelo: 1,
  laranja: 2,
  vermelho: 3,
}
