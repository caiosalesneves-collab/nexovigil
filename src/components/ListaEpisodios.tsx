import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROTULO_PROCEDIMENTO } from '../config/protocolos'
import { PESO_NIVEL } from '../config/regras-alerta'
import { PROFISSIONAIS } from '../data/cenarios'
import { useEstado } from '../estado/EstadoContext'
import { BORDA_NIVEL, ETIQUETA_NIVEL, PILULA_NIVEL, PONTO_NIVEL, ROTULO_STATUS_ALERTA, formatarDataHora } from './rotulos'

export function ListaEpisodios() {
  const { episodios } = useEstado()
  const [busca, setBusca] = useState('')
  const termo = busca.trim().toLowerCase()
  const lista = episodios
    .filter((e) => !termo || e.paciente.nome.toLowerCase().includes(termo))
    .sort((a, b) => PESO_NIVEL[b.nivel] - PESO_NIVEL[a.nivel] || a.paciente.nome.localeCompare(b.paciente.nome))

  return (
    <div className="space-y-4">
      <label className="block max-w-md text-xs font-medium text-slate-600">
        Buscar paciente fictício
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Nome"
          className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
        />
      </label>
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {lista.map((ep) => {
          const resp = PROFISSIONAIS.find((p) => p.id === ep.alerta?.responsavelId)
          return (
            <li key={ep.id}>
              <Link
                to={`/episodio/${ep.id}`}
                className={`block rounded-xl border border-l-4 border-slate-200 bg-white p-4 transition-shadow hover:shadow-md ${BORDA_NIVEL[ep.nivel]}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-900">{ep.paciente.nome}</p>
                  <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${PILULA_NIVEL[ep.nivel]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${PONTO_NIVEL[ep.nivel]}`} />
                    {ETIQUETA_NIVEL[ep.nivel]}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {ROTULO_PROCEDIMENTO[ep.procedimento.tipo]}, {ep.procedimento.regiao}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Procedimento em {formatarDataHora(ep.procedimento.dataHora)}
                  {ep.alerta && (
                    <>
                      <br />
                      Alerta: {ROTULO_STATUS_ALERTA[ep.alerta.status].toLowerCase()}, {resp ? resp.nome : 'sem responsável'}
                    </>
                  )}
                </p>
              </Link>
            </li>
          )
        })}
      </ul>
      {lista.length === 0 && <p className="text-sm text-slate-400">Nenhum paciente encontrado.</p>}
    </div>
  )
}
