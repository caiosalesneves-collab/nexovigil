// Etapa 1: tela inicial simples para validar estrutura, dados fictícios e publicação.
// O cockpit completo entra na Etapa 2.

import { BannerPrototipo } from './components/BannerPrototipo'
import {
  CLASSE_NIVEL,
  IMAGEM_INSUFICIENTE,
  ROTULO_NIVEL,
  ROTULO_STATUS_ALERTA,
  SIGNIFICADO_NIVEL,
  formatarDataHora,
  temImagemInsuficientePendente,
} from './components/rotulos'
import { ROTULO_PROCEDIMENTO } from './config/protocolos'
import { PESO_NIVEL } from './config/regras-alerta'
import { CLINICA_FICTICIA, PROFISSIONAIS } from './data/cenarios'
import { AGORA, EPISODIOS } from './data/episodios'
import type { NivelAlerta } from './types'

const NIVEIS: NivelAlerta[] = ['vermelho', 'laranja', 'amarelo', 'verde']

function nomeProfissional(id?: string) {
  return PROFISSIONAIS.find((p) => p.id === id)?.nome
}

export default function App() {
  const contagem = Object.fromEntries(
    NIVEIS.map((n) => [n, EPISODIOS.filter((e) => e.nivel === n).length]),
  ) as Record<NivelAlerta, number>

  const ordenados = [...EPISODIOS].sort(
    (a, b) =>
      PESO_NIVEL[b.nivel] - PESO_NIVEL[a.nivel] ||
      (a.alerta?.primeiroSinalEm ?? '').localeCompare(b.alerta?.primeiroSinalEm ?? ''),
  )

  return (
    <div className="min-h-screen">
      <BannerPrototipo />

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 md:px-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-teal-800">NexoVigil</h1>
            <p className="text-sm text-slate-500">Vigilância pós-procedimento. {CLINICA_FICTICIA}</p>
          </div>
          <p className="text-sm text-slate-500">Dados gerados em {formatarDataHora(AGORA.toISOString())}</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
        <section aria-label="Episódios por nível" className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {NIVEIS.map((n) => (
            <div key={n} className="rounded-xl border border-slate-200 bg-white p-4">
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${CLASSE_NIVEL[n]}`}>
                {ROTULO_NIVEL[n]}
              </span>
              <p className="mt-2 text-3xl font-semibold">{contagem[n]}</p>
              <p className="text-sm text-slate-500">{SIGNIFICADO_NIVEL[n]}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="font-semibold">Episódios em acompanhamento ({EPISODIOS.length})</h2>
            <p className="text-sm text-slate-500">
              Etapa 1: listagem de conferência dos dados fictícios. O cockpit com filas de prioridade vem na Etapa 2.
            </p>
          </div>
          <ul className="divide-y divide-slate-100">
            {ordenados.map((ep) => {
              const imagemInsuficiente = temImagemInsuficientePendente(ep)
              return (
                <li key={ep.id} className="grid gap-2 px-4 py-3 md:grid-cols-[8rem_1fr_12rem] md:items-start">
                  <div className="flex flex-wrap gap-1.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${CLASSE_NIVEL[ep.nivel]}`}>
                      {ROTULO_NIVEL[ep.nivel]}
                    </span>
                    {imagemInsuficiente && (
                      <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-white">
                        {IMAGEM_INSUFICIENTE}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">
                      {ep.paciente.nome}, {ep.paciente.idade} anos
                    </p>
                    <p className="text-sm text-slate-600">
                      {ROTULO_PROCEDIMENTO[ep.procedimento.tipo]}, {ep.procedimento.regiao}. Procedimento em{' '}
                      {formatarDataHora(ep.procedimento.dataHora)}
                    </p>
                    {ep.alerta && (
                      <ul className="mt-1 space-y-0.5 text-sm">
                        {ep.alerta.motivos.map((m) => (
                          <li key={m.regraId + m.checkpointRotulo} className="text-slate-700">
                            <span className="font-medium">Motivo:</span> {m.dado} ({m.descricao.toLowerCase()})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="text-sm text-slate-600 md:text-right">
                    {ep.alerta ? (
                      <>
                        <p>{ROTULO_STATUS_ALERTA[ep.alerta.status]}</p>
                        <p>{nomeProfissional(ep.alerta.responsavelId) ?? 'Sem responsável'}</p>
                        <p className="text-slate-400">Primeiro sinal {formatarDataHora(ep.alerta.primeiroSinalEm)}</p>
                      </>
                    ) : (
                      <p className="text-slate-400">Sem alerta</p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        <p className="pb-6 text-center text-xs text-slate-400">
          Regras de alerta: PLACEHOLDER, requerem validação clínica. Alertas indicam prioridade de avaliação, não diagnóstico.
        </p>
      </main>
    </div>
  )
}
