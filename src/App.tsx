import { Cockpit } from './components/Cockpit'
import { Layout } from './components/Layout'
import { ProvedorEstado } from './estado/EstadoContext'

export default function App() {
  return (
    <ProvedorEstado>
      <Layout titulo="Cockpit" subtitulo="Visão operacional da vigilância pós-procedimento">
        <Cockpit />
      </Layout>
    </ProvedorEstado>
  )
}
