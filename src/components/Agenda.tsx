// Etapa 3: agenda mensal de vigilância. Mostra, por dia, procedimentos, checkpoints e alertas.

import { useMemo, useState } from 'react'
import { ROTULO_PROCEDIMENTO } from '../config/protocolos'
import { AGORA } from '../data/episodios'
import {
  FILTROS_PADRAO,
  alertasNoDia,
  chaveDia,
  emAcompanhamentoNoDia,
  filtrarEpisodios,
  itensPorDia,
  semanasDoMes,
  type EstadoItem,
  type FiltrosAgenda,
  type ItemAgenda,
} from '../estado/agenda'
import { useEstado } from '../estado/EstadoContext'
import type { NivelAlerta, StatusAlerta, TipoProcedimento } from '../types'
import { ETIQUETA_NIVEL, IMAGEM_INSUFICIENTE, PONTO_NIVEL, ROTULO_STATUS_ALERTA } from './rotulos'

const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const NIVEIS: NivelAlerta[] = ['vermelho', 'laranja', 'amarelo', 'verde']

const COR_ALERTA: Record<NivelAlerta, string> = {
  vermelho: 'bg-red-50 text-red-800 border-l-red-500',
  laranja: 'bg-orange-50 text-orange-800 border-l-orange-500',
  amarelo: 'bg-amber-50 text-amber-900 border-l-amber-400',
  verde: 'bg-emerald-50 text-emerald-800 border-l-emerald-500',
}

const COR_ESTADO: Record<Exclude<EstadoItem, 'alerta'>, string> = {
  procedimento: 'bg-sky-50 text-sky-800 border-l-sky-500',
  respondido: 'bg-emerald-50 text-emerald-800 border-l-emerald-500',
  sem_resposta: 'bg-amber-50 text-amber-900 border-l-amber-400',
  imagem_insuficiente: 'bg-slate-800 text-white border-l-slate-950',
  aguardando: 'bg-slate-100 text-slate-700 border-l-slate-400',
  agendado: 'bg-white text-slate-500 border-l-slate-300 border border-dashed border-slate-200',
}

function corItem(item: ItemAgenda): string {
  if (item.estado === 'alerta') return COR_ALERTA[item.nivel]
  if (item.estado === 'sem_resposta' && item.nivel !== 'verde') return COR_ALERTA[item.nivel]
  return COR_ESTADO[item.estado]
}

const LEGENDA: { rotulo: string; classe: string }[] = [
  { rotulo: ETIQUETA_NIVEL.vermelho, classe: COR_ALERTA.vermelho },
  { rotulo: ETIQUETA_NIVEL.laranja, classe: COR_ALERTA.laranja },
  { rotulo: ETIQUETA_NIVEL.amarelo, classe: COR_ALERTA.amarelo },
  { rotulo: 'Respondido sem alerta', classe: COR_ESTADO.respondido },
  { rotulo: IMAGEM_INSUFICIENTE, classe: COR_ESTADO.imagem_insuficiente },
  { rotulo: 'Aguardando resposta', classe: COR_ESTADO.aguardando },
  { rotulo: 'Agendado', classe: COR_ESTADO.agendado },
  { rotulo: 'Procedimento', classe: COR_ESTADO.procedimento },
]

function primeiroNome(nome: string) {
  const p = nome.split(' ')
  return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : nome
}

function maiuscula(t: string) {
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function hora(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function Seletor<T extends string>({
  rotulo,
  valor,
  opcoes,
  onChange,
}: {
  rotulo: string
  valor: T
  opcoes: { valor: T; rotulo: string }[]
  onChange: (v: T) => void
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-slate-600 sm:flex-none">
      {rotulo}
      <select
        className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 sm:min-w-48"
        value={valor}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </label>
  )
}

function Filtros({ filtros, setFiltros }: { filtros: FiltrosAgenda; setFiltros: (f: FiltrosAgenda) => void }) {
  const ativos = filtros.procedimento !== 'todos' || filtros.nivel !== 'todos' || filtros.status !== 'todos'
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <Seletor<TipoProcedimento | 'todos'>
        rotulo="Procedimento"
        valor={filtros.procedimento}
        onChange={(procedimento) => setFiltros({ ...filtros, procedimento })}
        opcoes={[
          { valor: 'todos', rotulo: 'Todos' },
          ...(Object.keys(ROTULO_PROCEDIMENTO) as TipoProcedimento[]).map((t) => ({ valor: t, rotulo: ROTULO_PROCEDIMENTO[t] })),
        ]}
      />
      <Seletor<NivelAlerta | 'todos'>
        rotulo="Nível"
        valor={filtros.nivel}
        onChange={(nivel) => setFiltros({ ...filtros, nivel })}
        opcoes={[{ valor: 'todos', rotulo: 'Todos' }, ...NIVEIS.map((n) => ({ valor: n, rotulo: ETIQUETA_NIVEL[n] }))]}
      />
      <Seletor<StatusAlerta | 'sem_alerta' | 'todos'>
        rotulo="Status do alerta"
        valor={filtros.status}
        onChange={(status) => setFiltros({ ...filtros, status })}
        opcoes={[
          { valor: 'todos', rotulo: 'Todos' },
          { valor: 'sem_alerta', rotulo: 'Sem alerta' },
          ...(Object.keys(ROTULO_STATUS_ALERTA) as StatusAlerta[]).map((s) => ({ valor: s, rotulo: ROTULO_STATUS_ALERTA[s] })),
        ]}
      />
      {ativos && (
        <button
          type="button"
          onClick={() => setFiltros(FILTROS_PADRAO)}
          className="min-h-11 rounded-lg px-3 text-sm font-medium text-sky-700 hover:bg-sky-50"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}

function CelulaDia({
  dia,
  foraDoMes,
  itens,
  emAcompanhamento,
  alertas,
  selecionado,
  onSelecionar,
}: {
  dia: Date
  foraDoMes: boolean
  itens: ItemAgenda[]
  emAcompanhamento: number
  alertas: NivelAlerta[]
  selecionado: boolean
  onSelecionar: () => void
}) {
  const hoje = chaveDia(dia) === chaveDia(AGORA)
  const visiveis = itens.slice(0, 3)
  return (
    <button
      type="button"
      onClick={onSelecionar}
      aria-pressed={selecionado}
      aria-label={`${dia.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}: ${itens.length} eventos, ${emAcompanhamento} em acompanhamento`}
      className={`flex min-h-28 min-w-0 flex-col gap-1 border-b border-r border-slate-100 p-1.5 text-left align-top transition-colors md:min-h-32 ${
        foraDoMes ? 'bg-slate-50/60 text-slate-400' : 'bg-white'
      } ${selecionado ? 'ring-2 ring-inset ring-sky-500' : 'hover:bg-sky-50/40'}`}
    >
      <div className="flex items-center justify-between gap-1">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
            hoje ? 'bg-sky-600 text-white' : ''
          }`}
        >
          {dia.getDate()}
        </span>
        <span className="flex gap-1" aria-hidden="true">
          {NIVEIS.filter((n) => alertas.includes(n)).map((n) => {
            const qtd = alertas.filter((a) => a === n).length
            return (
              <span key={n} className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-600">
                <span className={`h-2 w-2 rounded-full ${PONTO_NIVEL[n]}`} />
                {qtd > 1 ? qtd : ''}
              </span>
            )
          })}
        </span>
      </div>
      {visiveis.map((item) => (
        <span
          key={item.id}
          className={`block truncate rounded border-l-[3px] px-1 py-0.5 text-[11px] leading-tight ${corItem(item)}`}
        >
          {primeiroNome(item.episodio.paciente.nome)}, {item.rotulo === 'Procedimento' ? 'proc.' : item.rotulo}
        </span>
      ))}
      {itens.length > 3 && <span className="text-[11px] text-slate-500">+{itens.length - 3} mais</span>}
      {emAcompanhamento > 0 && !foraDoMes && (
        <span className="mt-auto text-[10px] text-slate-400">{emAcompanhamento} em acompanhamento</span>
      )}
    </button>
  )
}

function DetalheDia({ dia, itens, emAcompanhamento }: { dia: Date; itens: ItemAgenda[]; emAcompanhamento: number }) {
  const titulo = maiuscula(dia.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }))
  return (
    <section className="rounded-xl border border-slate-200 bg-white" aria-live="polite">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="font-semibold text-slate-900">{titulo}</h2>
        <p className="text-xs text-slate-500">
          {itens.length} {itens.length === 1 ? 'evento' : 'eventos'}, {emAcompanhamento} pacientes em acompanhamento
        </p>
      </div>
      {itens.length === 0 ? (
        <p className="px-4 py-4 text-sm text-slate-400">Nenhum evento neste dia com os filtros atuais.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {itens.map((item) => {
            const ep = item.episodio
            return (
              <li key={item.id} className={`border-l-4 px-4 py-3 ${corItem(item).split(' ').filter((c) => c.startsWith('border-l-')).join(' ')}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">{ep.paciente.nome}</p>
                    <p className="text-xs text-slate-500">
                      {ROTULO_PROCEDIMENTO[ep.procedimento.tipo]}, {ep.procedimento.regiao}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">
                    {hora(item.quando)}, {item.rotulo}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-700">{item.descricao}</p>
                {ep.alerta && item.estado !== 'procedimento' && item.estado !== 'agendado' && (
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                    <span className={`h-1.5 w-1.5 rounded-full ${PONTO_NIVEL[ep.alerta.nivel]}`} />
                    Alerta do episódio: {ETIQUETA_NIVEL[ep.alerta.nivel]}, {ROTULO_STATUS_ALERTA[ep.alerta.status].toLowerCase()}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export function Agenda() {
  const { episodios } = useEstado()
  const [mes, setMes] = useState(() => new Date(AGORA.getFullYear(), AGORA.getMonth(), 1))
  const [selecionado, setSelecionado] = useState<Date>(() => new Date(AGORA.getFullYear(), AGORA.getMonth(), AGORA.getDate()))
  const [filtros, setFiltros] = useState<FiltrosAgenda>(FILTROS_PADRAO)

  const filtrados = useMemo(() => filtrarEpisodios(episodios, filtros), [episodios, filtros])
  const porDia = useMemo(() => itensPorDia(filtrados), [filtrados])
  const semanas = semanasDoMes(mes.getFullYear(), mes.getMonth())
  const tituloMes = maiuscula(mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }))

  const mudarMes = (delta: number) => setMes(new Date(mes.getFullYear(), mes.getMonth() + delta, 1))
  const irParaHoje = () => {
    setMes(new Date(AGORA.getFullYear(), AGORA.getMonth(), 1))
    setSelecionado(new Date(AGORA.getFullYear(), AGORA.getMonth(), AGORA.getDate()))
  }

  const kSel = chaveDia(selecionado)

  return (
    <div className="space-y-4">
      <Filtros filtros={filtros} setFiltros={setFiltros} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white" aria-label="Calendário mensal">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
            <h2 className="text-lg font-semibold text-slate-900">{tituloMes}</h2>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => mudarMes(-1)} className="min-h-11 min-w-11 rounded-lg border border-slate-300 px-3 text-sm hover:bg-slate-50" aria-label="Mês anterior">
                &lsaquo;
              </button>
              <button type="button" onClick={irParaHoje} className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm hover:bg-slate-50">
                Hoje
              </button>
              <button type="button" onClick={() => mudarMes(1)} className="min-h-11 min-w-11 rounded-lg border border-slate-300 px-3 text-sm hover:bg-slate-50" aria-label="Próximo mês">
                &rsaquo;
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center text-xs font-medium text-slate-500">
            {DIAS_SEMANA.map((d) => (
              <div key={d} className="py-1.5">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {semanas.flat().map((dia) => {
              const k = chaveDia(dia)
              const itens = porDia.get(k) ?? []
              return (
                <CelulaDia
                  key={k}
                  dia={dia}
                  foraDoMes={dia.getMonth() !== mes.getMonth()}
                  itens={itens}
                  emAcompanhamento={emAcompanhamentoNoDia(filtrados, dia)}
                  alertas={alertasNoDia(filtrados, k).map((e) => e.alerta!.nivel)}
                  selecionado={k === kSel}
                  onSelecionar={() => setSelecionado(dia)}
                />
              )
            })}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 border-t border-slate-100 px-3 py-2">
            {LEGENDA.map((l) => (
              <span key={l.rotulo} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <span className={`h-3 w-4 rounded-sm border-l-[3px] ${l.classe}`} />
                {l.rotulo}
              </span>
            ))}
            <span className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <span className="h-2 w-2 rounded-full bg-red-500" /> Ponto: alertas com primeiro sinal no dia
            </span>
          </div>
        </section>

        <DetalheDia dia={selecionado} itens={porDia.get(kSel) ?? []} emAcompanhamento={emAcompanhamentoNoDia(filtrados, selecionado)} />
      </div>

      <p className="pb-4 text-center text-xs text-slate-400">
        {filtrados.length} de {episodios.length} episódios exibidos. Datas fictícias, relativas ao momento em que a página foi aberta.
      </p>
    </div>
  )
}
