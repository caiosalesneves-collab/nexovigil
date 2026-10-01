import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { CLINICA_FICTICIA, PROFISSIONAIS } from '../data/cenarios'
import { useEstado } from '../estado/EstadoContext'
import { BannerPrototipo } from './BannerPrototipo'

const NAV = [
  { rotulo: 'Cockpit', caminho: '/', etapa: '' },
  { rotulo: 'Agenda de vigilância', caminho: '/agenda', etapa: '' },
  { rotulo: 'Episódios', caminho: '', etapa: 'Etapa 4' },
]

function ItemNav({ item, compacto }: { item: (typeof NAV)[number]; compacto?: boolean }) {
  const base = compacto ? 'whitespace-nowrap rounded-lg px-3 py-2 text-sm' : 'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm'
  if (!item.caminho) {
    return (
      <div className={`${base} text-slate-500`} aria-disabled="true">
        {item.rotulo}
        {!compacto && <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500">{item.etapa}</span>}
      </div>
    )
  }
  return (
    <NavLink
      to={item.caminho}
      end
      className={({ isActive }) =>
        `${base} ${isActive ? 'bg-sky-500/15 font-medium text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`
      }
    >
      {item.rotulo}
    </NavLink>
  )
}

function Marca() {
  return (
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        <path d="M2 12h4l2-5 4 10 2-5h8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-lg font-semibold tracking-tight text-white">NexoVigil</span>
    </div>
  )
}

function SeletorUsuario() {
  const { usuario, setUsuario } = useEstado()
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <span className="hidden sm:inline">Perfil simulado</span>
      <select
        className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
        value={usuario.id}
        onChange={(e) => setUsuario(PROFISSIONAIS.find((p) => p.id === e.target.value)!)}
      >
        {PROFISSIONAIS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Layout({ titulo, subtitulo, children }: { titulo: string; subtitulo: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <BannerPrototipo />
      <div className="lg:flex">
        {/* Menu lateral (desktop e iPad paisagem) */}
        <aside className="hidden lg:sticky lg:top-9 lg:flex lg:h-[calc(100vh-2.25rem)] lg:w-60 lg:flex-col lg:bg-[#0c1b33] lg:px-4 lg:py-5">
          <Marca />
          <p className="mt-1 text-xs text-slate-400">Vigilância pós-procedimento</p>
          <nav className="mt-8 space-y-1" aria-label="Navegação principal">
            {NAV.map((item) => (
              <ItemNav key={item.rotulo} item={item} />
            ))}
          </nav>
          <p className="mt-auto text-xs leading-relaxed text-slate-500">{CLINICA_FICTICIA}</p>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Barra superior compacta (iPad retrato e telas menores) */}
          <div className="flex items-center justify-between bg-[#0c1b33] px-4 py-3 lg:hidden">
            <Marca />
            <nav className="flex gap-1 overflow-x-auto" aria-label="Navegação principal">
              {NAV.filter((i) => i.caminho).map((item) => (
                <ItemNav key={item.rotulo} item={item} compacto />
              ))}
            </nav>
          </div>

          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 md:px-6">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">{titulo}</h1>
              <p className="text-sm text-slate-500">{subtitulo}</p>
            </div>
            <SeletorUsuario />
          </header>

          <main className="px-4 py-5 md:px-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
