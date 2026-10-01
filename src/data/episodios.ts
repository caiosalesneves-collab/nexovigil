// Gera os episódios fictícios a partir dos cenários. Determinístico: as datas são
// relativas ao momento em que a página é carregada.

import { PRAZO_RESPOSTA_HORAS, PROTOCOLOS } from '../config/protocolos'
import { avaliarEpisodio } from '../engine/motor-regras'
import type {
  Checkpoint,
  CheckpointProtocolo,
  Episodio,
  EventoAuditoria,
  Foto,
  QualidadeFoto,
  Respostas,
  TipoProcedimento,
} from '../types'
import { CENARIOS, PROFISSIONAIS, type Cenario } from './cenarios'
import { gerarFotoPlaceholder } from './foto-placeholder'

const HORA = 3600_000
const MINUTO = 60_000

// Arredonda para o minuto para evitar datas "quebradas" na interface.
export const AGORA = new Date(Math.floor(Date.now() / MINUTO) * MINUTO)

const PRODUTO: Record<TipoProcedimento, { produto: string; quantidade: string }> = {
  toxina_botulinica: { produto: 'Toxina Demo 100U', quantidade: '30 U' },
  preenchedor_ah: { produto: 'AH Demo Volume', quantidade: '1 ml' },
  bioestimulador: { produto: 'Bioestimulador Demo', quantidade: '1 frasco' },
  fios_pdo: { produto: 'Fio PDO Demo espiculado', quantidade: '8 fios' },
  peeling: { produto: 'Peeling Demo 35%', quantidade: '1 aplicação' },
}

function iso(ms: number) {
  return new Date(ms).toISOString()
}

function respostasPadrao(cp: CheckpointProtocolo, indice: number): Respostas {
  const h = cp.horasApos
  const base: Respostas = {
    dor_intensidade: h <= 6 ? 3 : h <= 48 ? 2 : h <= 168 ? 1 : 0,
    dor_tendencia: indice === 0 ? 'igual' : 'melhorando',
    edema_tendencia: h <= 48 ? 'igual' : h <= 168 ? 'melhorando' : 'ausente',
    mudanca_cor_pele: 'nenhuma',
    alteracao_visual: false,
    ardencia: h <= 24 ? 'moderada' : h <= 48 ? 'leve' : 'ausente',
  }
  return Object.fromEntries(cp.perguntas.map((p) => [p, base[p]])) as Respostas
}

function criarFotos(prefixo: string, rotulo: string, qualidades: QualidadeFoto[], inicio: number, semente: number): Foto[] {
  return qualidades.map((qualidade, i) => ({
    id: `${prefixo}-foto-${i + 1}`,
    url: gerarFotoPlaceholder(rotulo, qualidade, semente),
    capturadaEm: iso(inicio + i * 25 * MINUTO),
    qualidade,
    tentativa: i + 1,
  }))
}

function gerarCheckpoints(epId: string, c: Cenario, inicioProc: number, semente: number): Checkpoint[] {
  const protocolo = PROTOCOLOS[c.tipo]
  return protocolo.checkpoints.map((cp, i): Checkpoint => {
    const previsto = inicioProc + cp.horasApos * HORA
    const evento = c.eventos?.[cp.rotulo]
    const comum = {
      id: `${epId}-cp-${cp.rotulo}`,
      rotulo: cp.rotulo,
      horasApos: cp.horasApos,
      previstoPara: iso(previsto),
      prazoRespostaHoras: PRAZO_RESPOSTA_HORAS,
      exigeFoto: cp.exigeFoto,
    }
    const vazio: Checkpoint = { ...comum, status: 'pendente', respostas: {}, fotos: [] }

    if (previsto > AGORA.getTime()) return vazio
    if (evento?.status === 'pendente') return vazio
    if (evento?.status === 'sem_resposta') return { ...vazio, status: 'sem_resposta' }

    // Respondido: eventos respondem 20 min após o previsto; os demais variam de 20 a 59 min.
    const atraso = evento ? 20 : 20 + ((semente * 7 + i * 13) % 40)
    const respondidoEm = previsto + atraso * MINUTO
    if (respondidoEm > AGORA.getTime()) return vazio

    const respostas = { ...respostasPadrao(cp, i), ...evento?.respostas }
    const qualidades: QualidadeFoto[] = cp.exigeFoto ? evento?.fotos ?? ['aprovada'] : []
    const fotos = criarFotos(comum.id, cp.rotulo, qualidades, respondidoEm + 2 * MINUTO, semente + i)
    const status = evento?.status === 'aguardando_foto' ? 'aguardando_foto' : 'respondido'
    return { ...comum, status, respondidoEm: iso(respondidoEm), respostas, fotos }
  })
}

const ROTULO_STATUS_AUDITORIA: Record<string, string> = {
  visualizado: 'Alerta visualizado',
  contato_realizado: 'Status alterado para: contato realizado',
  nova_imagem_solicitada: 'Status alterado para: nova imagem solicitada',
  avaliacao_presencial: 'Status alterado para: avaliação presencial',
  encaminhado: 'Status alterado para: encaminhado',
  encerrado: 'Status alterado para: encerrado',
}

function gerarEpisodio(c: Cenario, indice: number): Episodio {
  const n = String(indice + 1).padStart(2, '0')
  const epId = `ep-${n}`
  const profissional = PROFISSIONAIS[c.profissional]
  const inicioProc = AGORA.getTime() - c.horasAtras * HORA
  const checkpoints = gerarCheckpoints(epId, c, inicioProc, indice)
  const avaliacao = avaliarEpisodio(c.tipo, checkpoints, AGORA)

  const auditoria: EventoAuditoria[] = []
  const registrar = (ms: number, usuario: string, acao: string) => {
    auditoria.push({ id: `${epId}-aud-${auditoria.length + 1}`, dataHora: iso(Math.min(ms, AGORA.getTime())), usuario, acao })
  }
  registrar(inicioProc, profissional.nome, 'Procedimento registrado')
  registrar(inicioProc + MINUTO, 'Sistema', `Protocolo de acompanhamento iniciado (${checkpoints.length} checkpoints)`)
  for (const cp of checkpoints) {
    if (cp.respondidoEm) {
      registrar(new Date(cp.respondidoEm).getTime(), 'Paciente (simulado)', `Respostas recebidas no checkpoint ${cp.rotulo}`)
      for (const f of cp.fotos) {
        registrar(new Date(f.capturadaEm).getTime(), 'Sistema',
          `Foto recebida no ${cp.rotulo} (tentativa ${f.tentativa}): ${f.qualidade === 'aprovada' ? 'qualidade aprovada' : 'imagem insuficiente para triagem'}`)
      }
    } else if (cp.status === 'sem_resposta') {
      registrar(new Date(cp.previstoPara).getTime() + cp.prazoRespostaHoras * HORA, 'Sistema', `Checkpoint ${cp.rotulo} sem resposta após o prazo`)
    }
  }

  let alerta: Episodio['alerta']
  if (avaliacao.nivel !== 'verde' && avaliacao.primeiroSinalEm) {
    const status = c.statusAlerta ?? 'novo'
    const responsavel = c.responsavel !== undefined ? PROFISSIONAIS[c.responsavel] : undefined
    const t0 = new Date(avaliacao.primeiroSinalEm).getTime()
    registrar(t0, 'Sistema', `Alerta ${avaliacao.nivel} gerado. Motivos: ${avaliacao.motivos.map((m) => m.dado).join('; ')}`)
    if (status !== 'novo') registrar(t0 + 8 * MINUTO, responsavel?.nome ?? 'Equipe', 'Alerta visualizado')
    if (responsavel) registrar(t0 + 10 * MINUTO, responsavel.nome, `Caso assumido por ${responsavel.nome}`)
    if (status !== 'novo' && status !== 'visualizado') {
      registrar(t0 + 40 * MINUTO, responsavel?.nome ?? 'Equipe', ROTULO_STATUS_AUDITORIA[status])
    }
    alerta = {
      id: `${epId}-alerta`,
      nivel: avaliacao.nivel,
      motivos: avaliacao.motivos,
      primeiroSinalEm: avaliacao.primeiroSinalEm,
      status,
      responsavelId: responsavel?.id,
    }
  }
  auditoria.sort((a, b) => a.dataHora.localeCompare(b.dataHora))

  return {
    id: epId,
    paciente: {
      id: `pac-${n}`,
      nome: c.nome,
      telefone: `(00) 90000-00${n}`,
      idade: c.idade,
    },
    procedimento: {
      id: `proc-${n}`,
      tipo: c.tipo,
      regiao: c.regiao,
      produto: PRODUTO[c.tipo].produto,
      lote: `LT-DEMO-${String(1000 + indice * 37)}`,
      quantidade: PRODUTO[c.tipo].quantidade,
      dataHora: iso(inicioProc),
      profissionalId: profissional.id,
    },
    fotoBaseline: {
      id: `${epId}-baseline`,
      url: gerarFotoPlaceholder('baseline', 'aprovada', indice),
      capturadaEm: iso(inicioProc - 15 * MINUTO),
      qualidade: 'aprovada',
      tentativa: 1,
    },
    checkpoints,
    nivel: avaliacao.nivel,
    alerta,
    auditoria,
    anotacoes: [],
  }
}

export const EPISODIOS: Episodio[] = CENARIOS.map(gerarEpisodio)
