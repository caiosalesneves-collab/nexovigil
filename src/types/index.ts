// Modelo de dados do protótipo. Todos os dados são fictícios.

export interface Profissional {
  id: string
  nome: string
  registro: string
  clinica: string
}

export interface Paciente {
  id: string
  nome: string
  telefone: string
  idade: number
}

export type TipoProcedimento =
  | 'toxina_botulinica'
  | 'preenchedor_ah'
  | 'bioestimulador'
  | 'fios_pdo'
  | 'peeling'

export interface Procedimento {
  id: string
  tipo: TipoProcedimento
  regiao: string
  produto: string
  lote: string
  quantidade: string
  dataHora: string // ISO
  profissionalId: string
}

// Perguntas padronizadas do protocolo (ver src/config/protocolos.ts)
export type PerguntaId =
  | 'dor_intensidade'
  | 'dor_tendencia'
  | 'edema_tendencia'
  | 'mudanca_cor_pele'
  | 'alteracao_visual'
  | 'ardencia'

export type Tendencia = 'ausente' | 'melhorando' | 'igual' | 'piorando'
export type CorPele = 'nenhuma' | 'palidez' | 'manchas_arroxeadas' | 'rendilhada'
export type Ardencia = 'ausente' | 'leve' | 'moderada' | 'intensa'

export interface Respostas {
  dor_intensidade?: number // 0 a 10
  dor_tendencia?: Tendencia
  edema_tendencia?: Tendencia
  mudanca_cor_pele?: CorPele
  alteracao_visual?: boolean
  ardencia?: Ardencia
}

export interface CheckpointProtocolo {
  rotulo: string // ex.: 2h, 6h, D1
  horasApos: number
  perguntas: PerguntaId[]
  exigeFoto: boolean
}

export interface Protocolo {
  tipo: TipoProcedimento
  checkpoints: CheckpointProtocolo[]
}

export type StatusCheckpoint = 'pendente' | 'respondido' | 'sem_resposta' | 'aguardando_foto'
export type QualidadeFoto = 'aprovada' | 'insuficiente'

export interface Foto {
  id: string
  url: string // imagem placeholder local (SVG gerado)
  capturadaEm: string
  qualidade: QualidadeFoto
  tentativa: number
}

export interface Checkpoint {
  id: string
  rotulo: string
  horasApos: number
  previstoPara: string
  prazoRespostaHoras: number
  status: StatusCheckpoint
  respondidoEm?: string
  respostas: Respostas
  exigeFoto: boolean
  fotos: Foto[]
}

export type NivelAlerta = 'verde' | 'amarelo' | 'laranja' | 'vermelho'

export type StatusAlerta =
  | 'novo'
  | 'visualizado'
  | 'contato_realizado'
  | 'nova_imagem_solicitada'
  | 'avaliacao_presencial'
  | 'encaminhado'
  | 'encerrado'

export interface MotivoAlerta {
  regraId: string
  nivel: NivelAlerta
  descricao: string // texto da regra
  dado: string // o dado que acionou a regra
  checkpointRotulo: string
  detectadoEm: string
}

export interface Alerta {
  id: string
  nivel: NivelAlerta
  motivos: MotivoAlerta[]
  primeiroSinalEm: string
  status: StatusAlerta
  responsavelId?: string
}

export interface EventoAuditoria {
  id: string
  dataHora: string
  usuario: string
  acao: string
}

// Anotação livre do profissional. Fica separada da trilha de auditoria.
export interface AnotacaoProfissional {
  id: string
  dataHora: string
  autor: string
  texto: string
}

export interface Episodio {
  id: string
  paciente: Paciente
  procedimento: Procedimento
  fotoBaseline: Foto
  checkpoints: Checkpoint[]
  nivel: NivelAlerta
  alerta?: Alerta // ausente quando o nível é verde
  auditoria: EventoAuditoria[]
  anotacoes: AnotacaoProfissional[]
}
