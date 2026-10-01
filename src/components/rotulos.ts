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

// Visual inspirado no pitch deck: etiqueta clara com ponto colorido e borda lateral no cartão.
export const ETIQUETA_NIVEL: Record<NivelAlerta, string> = {
  vermelho: 'Prioridade máxima',
  laranja: 'Avaliar',
  amarelo: 'Atenção',
  verde: 'Sem alerta',
}

export const PILULA_NIVEL: Record<NivelAlerta, string> = {
  vermelho: 'bg-red-50 text-red-700 ring-red-200',
  laranja: 'bg-orange-50 text-orange-700 ring-orange-200',
  amarelo: 'bg-amber-50 text-amber-800 ring-amber-200',
  verde: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

export const PONTO_NIVEL: Record<NivelAlerta, string> = {
  vermelho: 'bg-red-500',
  laranja: 'bg-orange-500',
  amarelo: 'bg-amber-400',
  verde: 'bg-emerald-500',
}

export const BORDA_NIVEL: Record<NivelAlerta, string> = {
  vermelho: 'border-l-red-500',
  laranja: 'border-l-orange-500',
  amarelo: 'border-l-amber-400',
  verde: 'border-l-emerald-500',
}

export function iniciais(nome: string): string {
  const partes = nome.split(' ').filter(Boolean)
  return ((partes[0]?.[0] ?? '') + (partes[partes.length - 1]?.[0] ?? '')).toUpperCase()
}
