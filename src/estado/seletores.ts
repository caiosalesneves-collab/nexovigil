// Consultas derivadas sobre os episódios, usadas pelo cockpit.

import { PESO_NIVEL } from '../config/regras-alerta'
import { AGORA } from '../data/episodios'
import type { Checkpoint, Episodio, NivelAlerta } from '../types'

export type EpisodioComAlerta = Episodio & { alerta: NonNullable<Episodio['alerta']> }

export interface ItemCheckpoint {
  episodio: Episodio
  checkpoint: Checkpoint
}

const HORA = 3600_000

export function alertasAtivos(eps: Episodio[]): EpisodioComAlerta[] {
  return eps.filter((e): e is EpisodioComAlerta => !!e.alerta && e.alerta.status !== 'encerrado')
}

// Prioridade: nível (vermelho primeiro) e, dentro do nível, quem tem o primeiro sinal mais antigo.
export function ordenarPorPrioridade(eps: EpisodioComAlerta[]): EpisodioComAlerta[] {
  return [...eps].sort(
    (a, b) =>
      PESO_NIVEL[b.alerta.nivel] - PESO_NIVEL[a.alerta.nivel] ||
      a.alerta.primeiroSinalEm.localeCompare(b.alerta.primeiroSinalEm),
  )
}

export function vermelhosSemResponsavel(eps: Episodio[]): EpisodioComAlerta[] {
  return ordenarPorPrioridade(alertasAtivos(eps).filter((e) => e.alerta.nivel === 'vermelho' && !e.alerta.responsavelId))
}

export function semResponsavel(eps: Episodio[]): EpisodioComAlerta[] {
  return ordenarPorPrioridade(alertasAtivos(eps).filter((e) => !e.alerta.responsavelId))
}

// Checkpoints já disparados, ainda dentro do prazo de resposta.
export function aguardandoResposta(eps: Episodio[]): ItemCheckpoint[] {
  const t = AGORA.getTime()
  return eps
    .flatMap((episodio) => episodio.checkpoints.map((checkpoint) => ({ episodio, checkpoint })))
    .filter(({ checkpoint: c }) => {
      const previsto = new Date(c.previstoPara).getTime()
      return c.status === 'pendente' && previsto <= t && t <= previsto + c.prazoRespostaHoras * HORA
    })
    .sort((a, b) => a.checkpoint.previstoPara.localeCompare(b.checkpoint.previstoPara))
}

export function aguardandoFoto(eps: Episodio[]): ItemCheckpoint[] {
  return eps
    .flatMap((episodio) => episodio.checkpoints.map((checkpoint) => ({ episodio, checkpoint })))
    .filter(({ checkpoint }) => checkpoint.status === 'aguardando_foto')
}

export function contarPorNivel(eps: Episodio[]): Record<NivelAlerta, number> {
  const ativos = alertasAtivos(eps)
  return {
    vermelho: ativos.filter((e) => e.alerta.nivel === 'vermelho').length,
    laranja: ativos.filter((e) => e.alerta.nivel === 'laranja').length,
    amarelo: ativos.filter((e) => e.alerta.nivel === 'amarelo').length,
    verde: eps.length - ativos.length,
  }
}

export function indicadores(eps: Episodio[]) {
  const t = AGORA.getTime()
  const cps = eps.flatMap((e) => e.checkpoints)
  const respondidos = cps.filter((c) => c.respondidoEm)
  const disparados = cps.filter((c) => new Date(c.previstoPara).getTime() <= t)
  const tempoMedioMin = respondidos.length
    ? Math.round(
        respondidos.reduce((s, c) => s + (new Date(c.respondidoEm!).getTime() - new Date(c.previstoPara).getTime()), 0) /
          respondidos.length /
          60_000,
      )
    : 0
  const taxa = disparados.length ? Math.round((respondidos.length / disparados.length) * 100) : 0
  return { tempoMedioMin, taxa }
}
