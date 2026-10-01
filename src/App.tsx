import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Agenda } from './components/Agenda'
import { Cockpit } from './components/Cockpit'
import { Layout } from './components/Layout'
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ProvedorEstado>
  )
}
