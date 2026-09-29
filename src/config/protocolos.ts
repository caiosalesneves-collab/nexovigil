// PLACEHOLDER: requer validação clínica.
// Protocolos de acompanhamento fictícios, criados apenas para demonstração.

import type { PerguntaId, Protocolo, TipoProcedimento } from '../types'

export const AVISO_PLACEHOLDER = 'PLACEHOLDER: requer validação clínica'

export const ROTULO_PROCEDIMENTO: Record<TipoProcedimento, string> = {
  toxina_botulinica: 'Toxina botulínica',
  preenchedor_ah: 'Preenchedor de ácido hialurônico',
  bioestimulador: 'Bioestimulador',
  fios_pdo: 'Fios de PDO',
  peeling: 'Peeling',
}

export const TEXTO_PERGUNTA: Record<PerguntaId, string> = {
  dor_intensidade: 'De 0 a 10, qual a intensidade da dor agora?',
  dor_tendencia: 'Desde a última resposta, a dor está melhorando, igual ou piorando?',
  edema_tendencia: 'O inchaço está ausente, melhorando, igual ou piorando?',
  mudanca_cor_pele: 'Notou mudança de cor na pele da região (palidez, manchas arroxeadas ou aspecto rendilhado)?',
  alteracao_visual: 'Notou alguma alteração na visão?',
  ardencia: 'Como está a ardência na região?',
}

// Prazo, em horas, para considerar um checkpoint sem resposta.
export const PRAZO_RESPOSTA_HORAS = 4

const comum: PerguntaId[] = ['dor_intensidade', 'dor_tendencia', 'edema_tendencia']
const vascular: PerguntaId[] = [...comum, 'mudanca_cor_pele', 'alteracao_visual']

export const PROTOCOLOS: Record<TipoProcedimento, Protocolo> = {
  preenchedor_ah: {
    tipo: 'preenchedor_ah',
    checkpoints: [
      { rotulo: '2h', horasApos: 2, perguntas: vascular, exigeFoto: true },
      { rotulo: '6h', horasApos: 6, perguntas: vascular, exigeFoto: true },
      { rotulo: 'D1', horasApos: 24, perguntas: vascular, exigeFoto: true },
      { rotulo: 'D2', horasApos: 48, perguntas: vascular, exigeFoto: true },
      { rotulo: 'D7', horasApos: 168, perguntas: vascular, exigeFoto: true },
      { rotulo: 'D15', horasApos: 360, perguntas: comum, exigeFoto: true },
    ],
  },
  toxina_botulinica: {
    tipo: 'toxina_botulinica',
    checkpoints: [
      { rotulo: '6h', horasApos: 6, perguntas: comum, exigeFoto: false },
      { rotulo: 'D1', horasApos: 24, perguntas: [...comum, 'alteracao_visual'], exigeFoto: true },
      { rotulo: 'D7', horasApos: 168, perguntas: [...comum, 'alteracao_visual'], exigeFoto: true },
      { rotulo: 'D15', horasApos: 360, perguntas: comum, exigeFoto: true },
    ],
  },
  bioestimulador: {
    tipo: 'bioestimulador',
    checkpoints: [
      { rotulo: '6h', horasApos: 6, perguntas: vascular, exigeFoto: true },
      { rotulo: 'D1', horasApos: 24, perguntas: vascular, exigeFoto: true },
      { rotulo: 'D2', horasApos: 48, perguntas: vascular, exigeFoto: true },
      { rotulo: 'D7', horasApos: 168, perguntas: comum, exigeFoto: true },
      { rotulo: 'D15', horasApos: 360, perguntas: comum, exigeFoto: true },
    ],
  },
  fios_pdo: {
    tipo: 'fios_pdo',
    checkpoints: [
      { rotulo: '2h', horasApos: 2, perguntas: comum, exigeFoto: false },
      { rotulo: '6h', horasApos: 6, perguntas: [...comum, 'mudanca_cor_pele'], exigeFoto: true },
      { rotulo: 'D1', horasApos: 24, perguntas: [...comum, 'mudanca_cor_pele'], exigeFoto: true },
      { rotulo: 'D2', horasApos: 48, perguntas: [...comum, 'mudanca_cor_pele'], exigeFoto: true },
      { rotulo: 'D7', horasApos: 168, perguntas: comum, exigeFoto: true },
      { rotulo: 'D15', horasApos: 360, perguntas: comum, exigeFoto: true },
    ],
  },
  peeling: {
    tipo: 'peeling',
    checkpoints: [
      { rotulo: 'D1', horasApos: 24, perguntas: [...comum, 'ardencia', 'mudanca_cor_pele'], exigeFoto: true },
      { rotulo: 'D2', horasApos: 48, perguntas: [...comum, 'ardencia'], exigeFoto: true },
      { rotulo: 'D7', horasApos: 168, perguntas: [...comum, 'ardencia'], exigeFoto: true },
    ],
  },
}
