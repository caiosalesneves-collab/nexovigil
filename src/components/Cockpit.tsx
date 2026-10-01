// Etapa 2: cockpit. Mostra quem precisa de avaliação primeiro.
// Alertas indicam prioridade de avaliação, nunca probabilidade diagnóstica.

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ROTULO_PROCEDIMENTO } from '../config/protocolos'
import { PROFISSIONAIS } from '../data/cenarios'
import { useEstado } from '../estado/EstadoContext'
import {
  aguardandoFoto,
  aguardandoResposta,
  alertasAtivos,
  contarPorNivel,
  indicadores,
  ordenarPorPrioridade,
  semResponsavel,
  vermelhosSemResponsavel,
  type EpisodioComAlerta,
  type ItemCheckpoint,
} from '../estado/seletores'
import type { NivelAlerta } from '../types'
import { duracao, tempoDesde } from '../utils/tempo'
import {
  BORDA_NIVEL,
  ETIQUETA_NIVEL,
  IMAGEM_INSUFICIENTE,
  PILULA_NIVEL,
  PONTO_NIVEL,
  ROTULO_STATUS_ALERTA,
  SIGNIFICADO_NIVEL,
  iniciais,
} from './rotulos'

const NIVEIS: NivelAlerta[] = ['vermelho', 'laranja', 'amarelo', 'verde']
const HORA = 3600_000

function nomeProfissional(id?: string) {
  return PROFISSIONAIS.find((p) => p.id === id)?.nome
}

function EtiquetaNivel({ nivel }: { nivel: NivelAlerta }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${PILULA_NIVEL[nivel]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${PONTO_NIVEL[nivel]}`} />
      {ETIQUETA_NIVEL[nivel]}
    </span>
  )
}

function Avatar({ nome }: { nome: string }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
      {iniciais(nome)}
    </span>
  )
}

function BotaoAssumir({ episodioId, destaque }: { episodioId: string; destaque?: boolean }) {
  const { assumir } = useEstado()
  return (
    <button
      type="button"
      onClick={() => assumir(episodioId)}
      className={`min-h-11 rounded-lg px-4 text-sm font-medium transition-colors ${
        destaque ? 'bg-[#0c1b33] text-white hover:bg-[#172b4d]' : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
      }`}
    >
      Assumir caso
    </button>
  )
}

function CartaoAlerta({ ep, fixado }: { ep: EpisodioComAlerta; fixado?: boolean }) {
  const { agora } = useEstado()
  const { alerta, paciente, procedimento } = ep
  const responsavel = nomeProfissional(alerta.responsavelId)
  return (
    <article
      className={`rounded-xl border border-l-4 border-slate-200 bg-white p-4 ${BORDA_NIVEL[alerta.nivel]} ${
        fixado ? 'shadow-md shadow-red-100 ring-1 ring-red-200' : ''
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar nome={paciente.nome} />
          <div className="min-w-0">
            <Link to={`/episodio/${ep.id}`} className="font-medium text-slate-900 underline-offset-2 hover:text-sky-700 hover:underline">
              {paciente.nome}, {paciente.idade} anos
            </Link>
            <p className="text-sm text-slate-500">
              {ROTULO_PROCEDIMENTO[procedimento.tipo]}, {procedimento.regiao}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <EtiquetaNivel nivel={alerta.nivel} />
          <span className="text-xs text-slate-500">
            Primeiro sinal há <strong className="font-semibold text-slate-700">{tempoDesde(alerta.primeiroSinalEm, agora)}</strong>
          </span>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5 rounded-lg bg-slate-50 px-3 py-2 text-sm">
        {alerta.motivos.map((m) => (
          <li key={m.regraId + m.checkpointRotulo} className="flex gap-2">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${PONTO_NIVEL[m.nivel]}`} />
            <span>
              <span className="font-medium text-slate-800">Motivo:</span> {m.dado}
              <span className="block text-xs text-slate-500">
                Regra {m.regraId}: {m.descricao}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
            {ROTULO_STATUS_ALERTA[alerta.status]}
          </span>{' '}
          {responsavel ? (
            <>Responsável: {responsavel}</>
          ) : (
            <span className="font-medium text-red-700">Sem responsável</span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/episodio/${ep.id}`}
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-sky-700 hover:bg-sky-50"
          >
            Abrir ficha
          </Link>
          {!responsavel && <BotaoAssumir episodioId={ep.id} destaque={fixado} />}
        </div>
      </div>
    </article>
  )
}

function Contadores() {
  const { episodios } = useEstado()
  const c = contarPorNivel(episodios)
  const ind = indicadores(episodios)
  const caixa: Record<NivelAlerta, string> = {
    vermelho: 'bg-red-50 border-red-100 text-red-600',
    laranja: 'bg-orange-50 border-orange-100 text-orange-600',
    amarelo: 'bg-amber-50 border-amber-100 text-amber-600',
    verde: 'bg-emerald-50 border-emerald-100 text-emerald-600',
  }
  return (
    <section aria-label="Contadores por nível" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {NIVEIS.map((n) => (
        <div key={n} className={`rounded-xl border p-4 ${caixa[n]}`}>
          <p className="text-3xl font-semibold">{c[n]}</p>
          <p className="text-sm font-medium text-slate-800">{n === 'verde' ? 'Sem alerta ativo' : ETIQUETA_NIVEL[n]}</p>
          <p className="text-xs text-slate-500">{SIGNIFICADO_NIVEL[n]}</p>
        </div>
      ))}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-3xl font-semibold text-slate-800">{ind.tempoMedioMin} min</p>
        <p className="text-sm font-medium text-slate-800">Tempo médio de resposta</p>
        <p className="text-xs text-slate-500">Do envio do checkpoint à resposta</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-3xl font-semibold text-slate-800">{ind.taxa}%</p>
        <p className="text-sm font-medium text-slate-800">Checkpoints respondidos</p>
        <p className="text-xs text-slate-500">Entre os já enviados</p>
      </div>
    </section>
  )
}

function Painel({ titulo, total, descricao, children }: { titulo: string; total: number; descricao: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="flex items-center justify-between font-semibold text-slate-900">
          {titulo}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{total}</span>
        </h2>
        <p className="text-xs text-slate-500">{descricao}</p>
      </div>
      {total === 0 ? <p className="px-4 py-4 text-sm text-slate-400">Nenhum caso nesta fila.</p> : children}
    </section>
  )
}

function FilaAguardandoResposta({ itens }: { itens: ItemCheckpoint[] }) {
  const { agora } = useEstado()
  return (
    <ul className="divide-y divide-slate-100">
      {itens.map(({ episodio: ep, checkpoint: cp }) => {
        const restante = new Date(cp.previstoPara).getTime() + cp.prazoRespostaHoras * HORA - agora
        return (
          <li key={cp.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar nome={ep.paciente.nome} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{ep.paciente.nome}</p>
              <p className="truncate text-xs text-slate-500">
                Checkpoint {cp.rotulo}, {ROTULO_PROCEDIMENTO[ep.procedimento.tipo]}
              </p>
            </div>
            <span className={`shrink-0 text-xs font-medium ${restante > 0 ? 'text-slate-600' : 'text-amber-700'}`}>
              {restante > 0 ? `Prazo em ${duracao(restante)}` : 'Prazo vencido'}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

function FilaAguardandoFoto({ itens }: { itens: ItemCheckpoint[] }) {
  return (
    <ul className="divide-y divide-slate-100">
      {itens.map(({ episodio: ep, checkpoint: cp }) => {
        const ultima = cp.fotos[cp.fotos.length - 1]
        return (
          <li key={cp.id} className="flex items-center gap-3 px-4 py-3">
            {ultima && <img src={ultima.url} alt={`Foto fictícia do ${cp.rotulo}`} className="h-12 w-12 shrink-0 rounded-lg object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{ep.paciente.nome}</p>
              <p className="text-xs font-medium text-slate-800">{IMAGEM_INSUFICIENTE}</p>
              <p className="text-xs text-slate-500">
                Checkpoint {cp.rotulo}, {cp.fotos.length} {cp.fotos.length === 1 ? 'tentativa' : 'tentativas'}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function FilaSemResponsavel({ itens }: { itens: EpisodioComAlerta[] }) {
  const { agora } = useEstado()
  return (
    <ul className="divide-y divide-slate-100">
      {itens.map((ep) => (
        <li key={ep.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${PONTO_NIVEL[ep.alerta.nivel]}`} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{ep.paciente.nome}</p>
            <p className="truncate text-xs text-slate-500">
              {ETIQUETA_NIVEL[ep.alerta.nivel]}, há {tempoDesde(ep.alerta.primeiroSinalEm, agora)}
            </p>
          </div>
          <BotaoAssumir episodioId={ep.id} />
        </li>
      ))}
    </ul>
  )
}

export function Cockpit() {
  const { episodios } = useEstado()
  const fixados = vermelhosSemResponsavel(episodios)
  const idsFixados = new Set(fixados.map((e) => e.id))
  const fila = ordenarPorPrioridade(alertasAtivos(episodios)).filter((e) => !idsFixados.has(e.id))
  const respostas = aguardandoResposta(episodios)
  const fotos = aguardandoFoto(episodios)
  const orfaos = semResponsavel(episodios)

  return (
    <div className="space-y-5">
      {fixados.length > 0 && (
        <section aria-label="Prioridade máxima sem responsável" className="rounded-2xl border border-red-200 bg-red-50/60 p-3 md:p-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 px-1">
            <h2 className="font-semibold text-red-800">Prioridade máxima sem responsável ({fixados.length})</h2>
            <p className="text-xs text-red-700">Fixados no topo até alguém assumir o caso.</p>
          </div>
          <div className="grid gap-3 xl:grid-cols-2">
            {fixados.map((ep) => (
              <CartaoAlerta key={ep.id} ep={ep} fixado />
            ))}
          </div>
        </section>
      )}

      <Contadores />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-label="Alertas agora" className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold text-slate-900">Alertas agora ({fila.length})</h2>
            <p className="text-xs text-slate-500">Ordenados por nível e pelo tempo desde o primeiro sinal.</p>
          </div>
          {fila.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-400">Nenhum alerta ativo.</p>
          ) : (
            fila.map((ep) => <CartaoAlerta key={ep.id} ep={ep} />)
          )}
        </section>

        <div className="space-y-5 md:grid md:grid-cols-2 md:gap-5 md:space-y-0 lg:block lg:space-y-5">
          <Painel titulo="Casos sem responsável" total={orfaos.length} descricao="Alertas ativos que ninguém assumiu.">
            <FilaSemResponsavel itens={orfaos} />
          </Painel>
          <Painel titulo="Aguardando resposta" total={respostas.length} descricao="Checkpoints enviados, ainda dentro do prazo.">
            <FilaAguardandoResposta itens={respostas} />
          </Painel>
          <Painel titulo="Aguardando nova foto" total={fotos.length} descricao="A imagem recebida não permite triagem.">
            <FilaAguardandoFoto itens={fotos} />
          </Painel>
        </div>
      </div>

      <p className="pb-4 text-center text-xs text-slate-400">
        Regras de alerta: PLACEHOLDER, requerem validação clínica. Alertas indicam prioridade de avaliação, não diagnóstico.
      </p>
    </div>
  )
}
