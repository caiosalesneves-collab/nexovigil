// Motor de regras determinístico. Aplica as regras de src/config/regras-alerta.ts
// sobre os checkpoints de um episódio. Não diagnostica: apenas ordena prioridade
// de avaliação e registra quais dados acionaram cada regra.

import { PESO_NIVEL, REGRAS_ALERTA } from '../config/regras-alerta'
import type { Checkpoint, MotivoAlerta, NivelAlerta, TipoProcedimento } from '../types'

export interface ResultadoAvaliacao {
  nivel: NivelAlerta
  motivos: MotivoAlerta[]
  primeiroSinalEm?: string
}

function momentoDoSinal(cp: Checkpoint, regraId: string): string {
  // Sem resposta: o sinal surge quando o prazo vence.
  if (regraId === 'R-AMA-01') {
    return new Date(new Date(cp.previstoPara).getTime() + cp.prazoRespostaHoras * 3600_000).toISOString()
  }
  if (regraId === 'R-AMA-02') {
    const ultima = cp.fotos[cp.fotos.length - 1]
    if (ultima) return ultima.capturadaEm
  }
  return cp.respondidoEm ?? cp.previstoPara
}

export function avaliarEpisodio(tipo: TipoProcedimento, checkpoints: Checkpoint[], agora: Date): ResultadoAvaliacao {
  const motivos: MotivoAlerta[] = []
  for (const checkpoint of checkpoints) {
    for (const regra of REGRAS_ALERTA) {
      const dado = regra.avaliar({ tipo, checkpoint, agora })
      if (dado) {
        motivos.push({
          regraId: regra.id,
          nivel: regra.nivel,
          descricao: regra.descricao,
          dado,
          checkpointRotulo: checkpoint.rotulo,
          detectadoEm: momentoDoSinal(checkpoint, regra.id),
        })
      }
    }
  }

  // Nível final = maior nível entre os motivos. Vermelho prevalece sempre.
  const nivel = motivos.reduce<NivelAlerta>(
    (acc, m) => (PESO_NIVEL[m.nivel] > PESO_NIVEL[acc] ? m.nivel : acc),
    'verde',
  )
  motivos.sort((a, b) => PESO_NIVEL[b.nivel] - PESO_NIVEL[a.nivel] || a.detectadoEm.localeCompare(b.detectadoEm))
  const primeiroSinalEm = motivos.map((m) => m.detectadoEm).sort()[0]
  return { nivel, motivos, primeiroSinalEm }
}
