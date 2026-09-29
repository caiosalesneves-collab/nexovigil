// Cenários fictícios. Cada cenário vira um paciente com um episódio de acompanhamento.
// horasAtras: há quantas horas o procedimento ocorreu, relativo ao carregamento da página.
// eventos: sobrescreve o que aconteceu em checkpoints específicos.

import type { Profissional, QualidadeFoto, Respostas, StatusAlerta, StatusCheckpoint, TipoProcedimento } from '../types'

export const CLINICA_FICTICIA = 'Clínica Demonstração Aurora (fictícia)'

export const PROFISSIONAIS: Profissional[] = [
  { id: 'prof-1', nome: 'Dra. Lívia Andrade', registro: 'CRM-XX 000101 (fictício)', clinica: CLINICA_FICTICIA },
  { id: 'prof-2', nome: 'Dr. Otávio Brandão', registro: 'CRO-XX 000202 (fictício)', clinica: CLINICA_FICTICIA },
  { id: 'prof-3', nome: 'Dra. Sílvia Macedo', registro: 'CRM-XX 000303 (fictício)', clinica: CLINICA_FICTICIA },
  { id: 'prof-4', nome: 'Enf. Rafael Quintana', registro: 'COREN-XX 000404 (fictício)', clinica: CLINICA_FICTICIA },
]

export interface EventoCenario {
  status?: StatusCheckpoint
  respostas?: Respostas
  fotos?: QualidadeFoto[]
}

export interface Cenario {
  nome: string
  idade: number
  tipo: TipoProcedimento
  regiao: string
  horasAtras: number
  profissional: number // índice em PROFISSIONAIS
  eventos?: Record<string, EventoCenario>
  statusAlerta?: StatusAlerta
  responsavel?: number // índice em PROFISSIONAIS
}

export const CENARIOS: Cenario[] = [
  // Vermelho
  { nome: 'Helena Duarte', idade: 34, tipo: 'preenchedor_ah', regiao: 'Lábios', horasAtras: 7.5, profissional: 0,
    eventos: { '6h': { respostas: { dor_intensidade: 8, dor_tendencia: 'piorando' } } } },
  { nome: 'Camila Rocha', idade: 41, tipo: 'preenchedor_ah', regiao: 'Sulco nasogeniano', horasAtras: 26, profissional: 1,
    eventos: { D1: { respostas: { dor_intensidade: 5, mudanca_cor_pele: 'rendilhada' } } } },
  { nome: 'Juliana Prado', idade: 29, tipo: 'preenchedor_ah', regiao: 'Região glabelar', horasAtras: 3, profissional: 0,
    eventos: { '2h': { respostas: { alteracao_visual: true, dor_intensidade: 6 } } },
    statusAlerta: 'visualizado', responsavel: 0 },
  { nome: 'Fernanda Lima', idade: 47, tipo: 'bioestimulador', regiao: 'Malar', horasAtras: 30, profissional: 2,
    eventos: { D1: { respostas: { mudanca_cor_pele: 'manchas_arroxeadas' } } },
    statusAlerta: 'contato_realizado', responsavel: 1 },
  { nome: 'Patrícia Moura', idade: 52, tipo: 'fios_pdo', regiao: 'Terço médio', horasAtras: 8, profissional: 1,
    eventos: { '6h': { respostas: { mudanca_cor_pele: 'palidez' } } } },

  // Laranja
  { nome: 'Renata Campos', idade: 38, tipo: 'preenchedor_ah', regiao: 'Mento', horasAtras: 170, profissional: 0,
    eventos: { D7: { respostas: { edema_tendencia: 'piorando', dor_intensidade: 3 } } } },
  { nome: 'Beatriz Nogueira', idade: 44, tipo: 'bioestimulador', regiao: 'Contorno mandibular', horasAtras: 172, profissional: 2,
    eventos: { D7: { respostas: { edema_tendencia: 'piorando' } } },
    statusAlerta: 'avaliacao_presencial', responsavel: 2 },
  { nome: 'Larissa Teixeira', idade: 50, tipo: 'fios_pdo', regiao: 'Contorno mandibular', horasAtras: 169.5, profissional: 1,
    eventos: { D7: { respostas: { edema_tendencia: 'piorando', dor_intensidade: 4, dor_tendencia: 'igual' } } },
    statusAlerta: 'visualizado', responsavel: 1 },
  { nome: 'Carolina Mendes', idade: 36, tipo: 'toxina_botulinica', regiao: 'Terço superior', horasAtras: 170, profissional: 3,
    eventos: { D7: { respostas: { edema_tendencia: 'piorando' } } },
    responsavel: 0 },

  // Amarelo
  { nome: 'Aline Barros', idade: 31, tipo: 'toxina_botulinica', regiao: 'Região frontal', horasAtras: 32, profissional: 0,
    eventos: { D1: { status: 'sem_resposta' } } },
  { nome: 'Gabriela Fontes', idade: 39, tipo: 'preenchedor_ah', regiao: 'Olheiras', horasAtras: 54, profissional: 2,
    eventos: { D2: { status: 'sem_resposta' } },
    statusAlerta: 'visualizado', responsavel: 3 },
  { nome: 'Tatiane Ribeiro', idade: 27, tipo: 'peeling', regiao: 'Face total', horasAtras: 30, profissional: 3,
    eventos: { D1: { status: 'aguardando_foto', fotos: ['insuficiente', 'insuficiente'] } },
    statusAlerta: 'nova_imagem_solicitada', responsavel: 2 },
  { nome: 'Vanessa Cardoso', idade: 33, tipo: 'preenchedor_ah', regiao: 'Lábios', horasAtras: 52, profissional: 0,
    eventos: { D2: { status: 'aguardando_foto', fotos: ['insuficiente', 'insuficiente'] } } },
  { nome: 'Roberta Pires', idade: 45, tipo: 'bioestimulador', regiao: 'Região temporal', horasAtras: 366, profissional: 2,
    eventos: { D15: { status: 'sem_resposta' } } },
  { nome: 'Luciana Farias', idade: 49, tipo: 'fios_pdo', regiao: 'Sobrancelhas', horasAtras: 29, profissional: 1,
    eventos: { D1: { status: 'sem_resposta' } },
    statusAlerta: 'contato_realizado', responsavel: 1 },

  // Verde, aguardando resposta dentro do prazo
  { nome: 'Daniela Sampaio', idade: 35, tipo: 'toxina_botulinica', regiao: 'Pés de galinha', horasAtras: 25, profissional: 3,
    eventos: { D1: { status: 'pendente' } } },
  { nome: 'Priscila Viana', idade: 42, tipo: 'preenchedor_ah', regiao: 'Malar', horasAtras: 49.5, profissional: 0,
    eventos: { D2: { status: 'pendente' } } },
  { nome: 'Isabela Castro', idade: 26, tipo: 'peeling', regiao: 'Face total', horasAtras: 26, profissional: 3,
    eventos: { D1: { status: 'pendente' } } },

  // Verde, aguardando nova foto (uma foto insuficiente)
  { nome: 'Marcos Vieira', idade: 40, tipo: 'preenchedor_ah', regiao: 'Malar', horasAtras: 25.5, profissional: 1,
    eventos: { D1: { status: 'aguardando_foto', fotos: ['insuficiente'] } } },
  { nome: 'Ricardo Azevedo', idade: 46, tipo: 'toxina_botulinica', regiao: 'Região frontal', horasAtras: 170.5, profissional: 3,
    eventos: { D7: { status: 'aguardando_foto', fotos: ['insuficiente'] } } },

  // Verde, evolução sem sinais pelas regras
  { nome: 'Sofia Martins', idade: 30, tipo: 'toxina_botulinica', regiao: 'Terço superior', horasAtras: 100, profissional: 0 },
  { nome: 'Bianca Freitas', idade: 37, tipo: 'preenchedor_ah', regiao: 'Mento', horasAtras: 200, profissional: 2,
    eventos: { D7: { respostas: { edema_tendencia: 'piorando' } } },
    statusAlerta: 'encerrado', responsavel: 0 },
  { nome: 'Natália Rezende', idade: 43, tipo: 'bioestimulador', regiao: 'Malar', horasAtras: 80, profissional: 2 },
  { nome: 'Eduardo Lacerda', idade: 51, tipo: 'peeling', regiao: 'Face total', horasAtras: 60, profissional: 3 },
  { nome: 'Paula Correia', idade: 48, tipo: 'fios_pdo', regiao: 'Terço médio', horasAtras: 250, profissional: 1 },
]
