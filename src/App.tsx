import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Agenda } from './components/Agenda'
import { Cockpit } from './components/Cockpit'
import { FichaEpisodio } from './components/FichaEpisodio'
import { Layout } from './components/Layout'
import { ListaEpisodios } from './components/ListaEpisodios'
import { ProvedorEstado } from './estado/EstadoContext'

export default function App() {
  return (
    <ProvedorEstado>
      <HashRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Layout titulo="Cockpit" subtitulo="Visão operacional da vigilância pós-procedimento">
                <Cockpit />
              </Layout>
            }
          />
          <Route
            path="/agenda"
            element={
              <Layout titulo="Agenda de vigilância" subtitulo="Pacientes em acompanhamento, checkpoints e alertas por dia">
                <Agenda />
              </Layout>
            }
          />
          <Route
            path="/episodios"
            element={
              <Layout titulo="Episódios" subtitulo="Todos os pacientes fictícios em acompanhamento">
                <ListaEpisodios />
              </Layout>
            }
          />
          <Route
            path="/episodio/:id"
            element={
              <Layout titulo="Ficha do episódio" subtitulo="Procedimento, fotos, respostas, status e linha do tempo">
                <FichaEpisodio />
              </Layout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ProvedorEstado>
  )
}
