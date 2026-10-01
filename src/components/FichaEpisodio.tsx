// Etapa 4: ficha do episódio. Procedimento, motivos do alerta, fotos lado a lado,
// respostas por checkpoint, ações de status, anotação do profissional e linha do tempo auditável.
// Tudo em memória. O sistema não diagnostica: mostra dados relatados e prioridade de avaliação.

import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AVISO_PLACEHOLDER, ROTULO_PROCEDIMENTO, TEXTO_PERGUNTA } from '../config/protocolos'
import { PROFISSIONAIS } from '../data/cenarios'
import { useEstado } from '../estado/EstadoContext'
import type { Checkpoint, Episodio, Foto, PerguntaId, Respostas, StatusAlerta, StatusCheckpoint } from '../types'
import { tempoDesde } from '../utils/tempo'
import {
  ETIQUETA_NIVEL,
  IMAGEM_INSUFICIENTE,
  PILULA_NIVEL,
  PONTO_NIVEL,
  ROTULO_STATUS_ALERTA,
  formatarDataHora,
} from './rotulos'

const ROTULO_STATUS_CHECKPOINT: Record<StatusCheckpoint, string> = {
  pendente: 'Pendente',
  respondido: 'Respondido',
  sem_resposta: 'Sem resposta',
  aguardando_foto: 'Aguardando foto',
}

const ACOES_STATUS: StatusAlerta[] = [
  'visualizado',
  'contato_realizado',
  'nova_imagem_solicitada',
  'avaliacao_presencial',
  'encaminhado',
  'encerrado',
]

const TEXTO_RESPOSTA: Record<string, string> = {
  ausente: 'ausente',
  melhorando: 'melhorando',
  igual: 'igual',
  piorando: 'piorando',
  nenhuma: 'nenhuma',
  palidez: 'palidez',
  manchas_arroxeadas: 'manchas arroxeadas',
  rendilhada: 'aspecto rendilhado',
  leve: 'leve',
  moderada: 'moderada',
  intensa: 'intensa',
}

function formatarResposta(p: PerguntaId, r: Respostas): string {
  const v = r[p]
  if (v === undefined) return 'sem resposta'
  if (p === 'dor_intensidade') return `${v}/10`
  if (typeof v === 'boolean') return v ? 'sim' : 'não'
  return TEXTO_RESPOSTA[String(v)] ?? String(v)
}

function Cartao({ titulo, children, extra }: { titulo: string; children: ReactNode; extra?: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <h2 className="font-semibold text-slate-900">{titulo}</h2>
        {extra}
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

function Campo({ rotulo, valor }: { rotulo: string; valor: ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-100 py-2 text-sm last:border-0">
      <dt className="text-slate-500">{rotulo}</dt>
      <dd className="text-right font-medium text-slate-900">{valor}</dd>
    </div>
  )
}

function SeloQualidade({ foto }: { foto: Foto }) {
  return foto.qualidade === 'aprovada' ? (
    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
      Qualidade aprovada
    </span>
  ) : (
    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium text-white">{IMAGEM_INSUFICIENTE}</span>
  )
}

function Cabecalho({ ep }: { ep: Episodio }) {
  const { agora } = useEstado()
  return (
    <section className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <p className="text-xs text-slate-500">Episódio {ep.id}</p>
        <h2 className="text-xl font-semibold text-slate-900">
          {ep.paciente.nome}, {ep.paciente.idade} anos
        </h2>
        <p className="text-sm text-slate-500">
          {ROTULO_PROCEDIMENTO[ep.procedimento.tipo]}, {ep.procedimento.regiao}. Telefone fictício {ep.paciente.telefone}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ring-1 ${PILULA_NIVEL[ep.nivel]}`}>
          <span className={`h-2 w-2 rounded-full ${PONTO_NIVEL[ep.nivel]}`} />
          {ETIQUETA_NIVEL[ep.nivel]}
        </span>
        {ep.alerta && (
          <span className="text-xs text-slate-500">
            Primeiro sinal há {tempoDesde(ep.alerta.primeiroSinalEm, agora)} ({formatarDataHora(ep.alerta.primeiroSinalEm)})
          </span>
        )}
      </div>
    </section>
  )
}

function Acoes({ ep }: { ep: Episodio }) {
  const { usuario, assumir, mudarStatus } = useEstado()
  if (!ep.alerta) {
    return (
      <Cartao titulo="Status e responsável">
        <p className="text-sm text-slate-500">Nenhum alerta neste episódio. Não há status para alterar.</p>
      </Cartao>
    )
  }
  const alerta = ep.alerta
  const responsavel = PROFISSIONAIS.find((p) => p.id === alerta.responsavelId)
  const souResponsavel = responsavel?.id === usuario.id
  return (
    <Cartao titulo="Status e responsável">
      <dl>
        <Campo rotulo="Status atual" valor={ROTULO_STATUS_ALERTA[alerta.status]} />
        <Campo
          rotulo="Responsável"
          valor={responsavel ? responsavel.nome : <span className="text-red-700">Sem responsável</span>}
        />
      </dl>
      {!souResponsavel && (
        <button
          type="button"
          onClick={() => assumir(ep.id)}
          className="mt-3 min-h-11 w-full rounded-lg bg-[#0c1b33] px-4 text-sm font-medium text-white hover:bg-[#172b4d]"
        >
          {responsavel ? `Transferir para mim (${usuario.nome})` : `Assumir caso como ${usuario.nome}`}
        </button>
      )}
      <p className="mt-4 mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Mudar status</p>
      <div className="grid grid-cols-2 gap-2">
        {ACOES_STATUS.map((s) => {
          const atual = alerta.status === s
          return (
            <button
              key={s}
              type="button"
              aria-pressed={atual}
              disabled={atual}
              onClick={() => mudarStatus(ep.id, s)}
              className={`min-h-11 rounded-lg border px-2 text-sm font-medium ${
                atual
                  ? 'border-sky-600 bg-sky-50 text-sky-800'
                  : s === 'encerrado'
                    ? 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    : 'border-slate-300 text-slate-800 hover:bg-slate-50'
              }`}
            >
              {ROTULO_STATUS_ALERTA[s]}
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-xs text-slate-400">Ações simuladas, registradas apenas em memória e na linha do tempo.</p>
    </Cartao>
  )
}

function Motivos({ ep }: { ep: Episodio }) {
  if (!ep.alerta) {
    return (
      <Cartao titulo="Motivos do alerta">
        <p className="text-sm text-slate-500">Nenhuma regra de alerta foi acionada pelos dados recebidos até agora.</p>
      </Cartao>
    )
  }
  return (
    <Cartao titulo="Motivos do alerta" extra={<span className="text-xs text-slate-400">{AVISO_PLACEHOLDER}</span>}>
      <ul className="space-y-2">
        {ep.alerta.motivos.map((m) => (
          <li key={m.regraId + m.checkpointRotulo} className="flex gap-3 rounded-lg bg-slate-50 p-3">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${PONTO_NIVEL[m.nivel]}`} />
            <div className="text-sm">
              <p className="font-medium text-slate-900">{m.dado}</p>
              <p className="text-slate-600">
                Regra {m.regraId} ({ETIQUETA_NIVEL[m.nivel]}): {m.descricao}
              </p>
              <p className="text-xs text-slate-500">
                Checkpoint {m.checkpointRotulo}, detectado em {formatarDataHora(m.detectadoEm)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-500">
        O nível indica prioridade de avaliação pela equipe. Não representa diagnóstico nem probabilidade diagnóstica.
      </p>
    </Cartao>
  )
}

function QuadroFoto({ titulo, data, foto, vazio }: { titulo: string; data?: string; foto?: Foto; vazio?: string }) {
  return (
    <figure className="min-w-0 flex-1">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1">
        <figcaption className="text-sm font-semibold text-slate-900">{titulo}</figcaption>
        {data && <span className="text-xs text-slate-500">{formatarDataHora(data)}</span>}
      </div>
      {foto ? (
        <>
          <img src={foto.url} alt={`Foto fictícia, ${titulo}`} className="aspect-square w-full rounded-lg object-cover" />
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <SeloQualidade foto={foto} />
            <span className="text-xs text-slate-500">Tentativa {foto.tentativa}</span>
          </div>
          {foto.qualidade === 'insuficiente' && (
            <p className="mt-1 text-xs text-slate-600">Não usar esta imagem para comparação. Nova imagem necessária.</p>
          )}
        </>
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
          {vazio}
        </div>
      )}
    </figure>
  )
}

function textoSemFoto(cp: Checkpoint): string {
  if (!cp.exigeFoto) return 'Checkpoint sem foto no protocolo'
  if (cp.status === 'sem_resposta') return 'Sem resposta, nenhuma foto recebida'
  if (cp.status === 'pendente') return 'Checkpoint ainda não respondido'
  return 'Nenhuma foto recebida'
}

function Fotos({ ep }: { ep: Episodio }) {
  const comFoto = ep.checkpoints.filter((c) => c.fotos.length > 0)
  const [selId, setSelId] = useState<string | undefined>(comFoto[comFoto.length - 1]?.id ?? ep.checkpoints[0]?.id)
  const sel = ep.checkpoints.find((c) => c.id === selId)
  const [tentativa, setTentativa] = useState<number | null>(null)
  const fotoSel = sel ? (tentativa !== null ? sel.fotos[tentativa] : sel.fotos[sel.fotos.length - 1]) : undefined

  return (
    <Cartao titulo="Fotos lado a lado" extra={<span className="text-xs text-slate-400">Imagens placeholder fictícias</span>}>
      <div className="flex flex-col gap-4 sm:flex-row">
        <QuadroFoto titulo="Baseline" data={ep.fotoBaseline.capturadaEm} foto={ep.fotoBaseline} />
        {sel && (
          <QuadroFoto
            titulo={`Checkpoint ${sel.rotulo}`}
            data={fotoSel?.capturadaEm ?? sel.previstoPara}
            foto={fotoSel}
            vazio={textoSemFoto(sel)}
          />
        )}
      </div>

      {sel && sel.fotos.length > 1 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500">Tentativas no {sel.rotulo}:</span>
          {sel.fotos.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTentativa(i)}
              aria-pressed={fotoSel?.id === f.id}
              className={`min-h-11 rounded-lg border px-3 ${fotoSel?.id === f.id ? 'border-sky-600 bg-sky-50 text-sky-800' : 'border-slate-300'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <p className="mt-4 mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Comparar com o baseline</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {ep.checkpoints.map((c) => {
          const ultima = c.fotos[c.fotos.length - 1]
          const ativo = c.id === selId
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelId(c.id)
                setTentativa(null)
              }}
              aria-pressed={ativo}
              className={`w-20 shrink-0 rounded-lg border p-1 text-left ${ativo ? 'border-sky-600 ring-2 ring-sky-200' : 'border-slate-200'}`}
            >
              {ultima ? (
                <img src={ultima.url} alt="" className="aspect-square w-full rounded object-cover" />
              ) : (
                <span className="flex aspect-square w-full items-center justify-center rounded bg-slate-50 text-[10px] text-slate-400">
                  Sem foto
                </span>
              )}
              <span className="mt-1 block text-xs font-semibold text-slate-800">{c.rotulo}</span>
              <span className="block text-[10px] text-slate-500">
                {ultima ? (ultima.qualidade === 'aprovada' ? 'Aprovada' : 'Insuficiente') : ROTULO_STATUS_CHECKPOINT[c.status]}
              </span>
            </button>
          )
        })}
      </div>
    </Cartao>
  )
}

function Checkpoints({ ep }: { ep: Episodio }) {
  return (
    <Cartao titulo="Checkpoints e respostas">
      <ul className="divide-y divide-slate-100">
        {ep.checkpoints.map((cp) => {
          const perguntas = Object.keys(cp.respostas) as PerguntaId[]
          const motivos = ep.alerta?.motivos.filter((m) => m.checkpointRotulo === cp.rotulo) ?? []
          return (
            <li key={cp.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">
                  {cp.rotulo}{' '}
                  <span className="text-xs font-normal text-slate-500">previsto para {formatarDataHora(cp.previstoPara)}</span>
                </p>
                <span className="flex items-center gap-1.5 text-xs">
                  {motivos.length > 0 && (
                    <span className={`h-2 w-2 rounded-full ${PONTO_NIVEL[motivos[0].nivel]}`} aria-label="Regra acionada" />
                  )}
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                    {ROTULO_STATUS_CHECKPOINT[cp.status]}
                  </span>
                </span>
              </div>
              {perguntas.length > 0 ? (
                <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm md:grid-cols-2">
                  {perguntas.map((p) => (
                    <div key={p} className="flex justify-between gap-2">
                      <dt className="text-slate-500">{TEXTO_PERGUNTA[p]}</dt>
                      <dd className="shrink-0 font-medium text-slate-900">{formatarResposta(p, cp.respostas)}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-1 text-sm text-slate-400">Sem respostas registradas.</p>
              )}
              {cp.respondidoEm && <p className="mt-1 text-xs text-slate-400">Respondido em {formatarDataHora(cp.respondidoEm)}</p>}
            </li>
          )
        })}
      </ul>
    </Cartao>
  )
}

function Procedimento({ ep }: { ep: Episodio }) {
  const prof = PROFISSIONAIS.find((p) => p.id === ep.procedimento.profissionalId)
  const pr = ep.procedimento
  return (
    <Cartao titulo="Dados do procedimento">
      <dl>
        <Campo rotulo="Tipo" valor={ROTULO_PROCEDIMENTO[pr.tipo]} />
        <Campo rotulo="Região" valor={pr.regiao} />
        <Campo rotulo="Produto" valor={pr.produto} />
        <Campo rotulo="Lote" valor={pr.lote} />
        <Campo rotulo="Quantidade" valor={pr.quantidade} />
        <Campo rotulo="Data e hora" valor={formatarDataHora(pr.dataHora)} />
        <Campo rotulo="Profissional" valor={prof ? `${prof.nome}, ${prof.registro}` : 'Não informado'} />
      </dl>
    </Cartao>
  )
}

function Anotacoes({ ep }: { ep: Episodio }) {
  const { anotar, usuario } = useEstado()
  const [texto, setTexto] = useState('')
  const salvar = () => {
    const t = texto.trim()
    if (!t) return
    anotar(ep.id, t)
    setTexto('')
  }
  return (
    <Cartao titulo="Anotações do profissional" extra={<span className="text-xs text-slate-400">Separadas da trilha de auditoria</span>}>
      {ep.anotacoes.length > 0 ? (
        <ul className="mb-3 space-y-2">
          {ep.anotacoes.map((a) => (
            <li key={a.id} className="rounded-lg bg-sky-50/60 p-3 text-sm">
              <p className="whitespace-pre-wrap text-slate-800">{a.texto}</p>
              <p className="mt-1 text-xs text-slate-500">
                {a.autor}, {formatarDataHora(a.dataHora)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-3 text-sm text-slate-400">Nenhuma anotação ainda.</p>
      )}
      <label className="block text-xs font-medium text-slate-600" htmlFor={`nota-${ep.id}`}>
        Nova anotação como {usuario.nome}
      </label>
      <textarea
        id={`nota-${ep.id}`}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={3}
        placeholder="Registro livre do profissional. Use apenas dados fictícios."
        className="mt-1 w-full rounded-lg border border-slate-300 p-3 text-sm"
      />
      <button
        type="button"
        onClick={salvar}
        disabled={!texto.trim()}
        className="mt-2 min-h-11 rounded-lg bg-sky-600 px-4 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Salvar anotação
      </button>
    </Cartao>
  )
}

function corEvento(usuario: string, acao: string): string {
  if (acao.startsWith('Alerta ') && acao.includes('gerado')) {
    if (acao.includes('vermelho')) return PONTO_NIVEL.vermelho
    if (acao.includes('laranja')) return PONTO_NIVEL.laranja
    return PONTO_NIVEL.amarelo
  }
  if (usuario === 'Sistema') return 'bg-slate-400'
  if (usuario.startsWith('Paciente')) return 'bg-emerald-500'
  return 'bg-sky-600'
}

function LinhaDoTempo({ ep }: { ep: Episodio }) {
  const eventos = [...ep.auditoria].sort((a, b) => a.dataHora.localeCompare(b.dataHora))
  return (
    <Cartao titulo="Linha do tempo auditável" extra={<span className="text-xs text-slate-400">{eventos.length} eventos</span>}>
      <ol className="relative ml-1.5 border-l border-slate-200">
        {eventos.map((e) => (
          <li key={e.id} className="mb-4 ml-4 last:mb-0">
            <span className={`absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${corEvento(e.usuario, e.acao)}`} />
            <p className="text-xs text-slate-500">{formatarDataHora(e.dataHora)}</p>
            <p className="text-sm text-slate-900">{e.acao}</p>
            <p className="text-xs text-slate-500">{e.usuario}</p>
          </li>
        ))}
      </ol>
    </Cartao>
  )
}

export function FichaEpisodio() {
  const { id } = useParams()
  const { episodios } = useEstado()
  const ep = episodios.find((e) => e.id === id)
  if (!ep) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm">
        <p className="text-slate-700">Episódio não encontrado.</p>
        <Link to="/episodios" className="mt-2 inline-block font-medium text-sky-700">
          Ver todos os episódios
        </Link>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <Link to="/episodios" className="inline-flex min-h-11 items-center text-sm font-medium text-sky-700">
        &lsaquo; Todos os episódios
      </Link>
      <Cabecalho ep={ep} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-4">
          <Motivos ep={ep} />
          <Fotos key={ep.id} ep={ep} />
          <Checkpoints ep={ep} />
        </div>
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:block lg:space-y-4">
          <Acoes ep={ep} />
          <Procedimento ep={ep} />
          <Anotacoes ep={ep} />
          <LinhaDoTempo ep={ep} />
        </div>
      </div>
    </div>
  )
}
