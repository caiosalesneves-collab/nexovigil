import type { Episodio, NivelAlerta, StatusAlerta } from '../types'

export const ROTULO_NIVEL: Record<NivelAlerta, string> = {
  vermelho: 'Vermelho',
  laranja: 'Laranja',
  amarelo: 'Amarelo',
  verde: 'Verde',
}

// Nível indica prioridade de avaliação, nunca probabilidade diagnóstica.
export const SIGNIFICADO_NIVEL: Record<NivelAlerta, string> = {
  vermelho: 'Prioridade máxima de avaliação',
  laranja: 'Prioridade alta de avaliação',
  amarelo: 'Requer atenção da equipe',
  verde: 'Nenhuma regra acionada',
}

export const CLASSE_NIVEL: Record<NivelAlerta, string> = {
  vermelho: 'bg-red-600 text-white',
  laranja: 'bg-orange-500 text-white',
  amarelo: 'bg-yellow-300 text-yellow-950',
  verde: 'bg-emerald-600 text-white',
}

export const ROTULO_STATUS_ALERTA: Record<StatusAlerta, string> = {
  novo: 'Novo',
  visualizado: 'Visualizado',
  contato_realizado: 'Contato realizado',
  nova_imagem_solicitada: 'Nova imagem solicitada',
  avaliacao_presencial: 'Avaliação presencial',
  encaminhado: 'Encaminhado',
  encerrado: 'Encerrado',
}

export const IMAGEM_INSUFICIENTE = 'Imagem insuficiente para triagem'

// Regra 5: imagem inadequada nunca gera tranquilidade.
export function temImagemInsuficientePendente(ep: Episodio): boolean {
  return ep.checkpoints.some(
    (cp) =>
      cp.status === 'aguardando_foto' &&
      cp.fotos.length > 0 &&
      !cp.fotos.some((f) => f.qualidade === 'aprovada'),
  )
}

export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
