// Gera imagens placeholder locais (SVG em data URI). Nenhuma foto real é usada.

import type { QualidadeFoto } from '../types'

export function gerarFotoPlaceholder(rotulo: string, qualidade: QualidadeFoto, semente: number): string {
  const matiz = 20 + (semente * 37) % 30
  const insuficiente = qualidade === 'insuficiente'
  const fundo = insuficiente ? '#1f2937' : `hsl(${matiz} 35% 88%)`
  const rosto = insuficiente ? '#374151' : `hsl(${matiz} 40% 72%)`
  const filtro = insuficiente ? 'filter="url(#b)"' : ''
  const aviso = insuficiente
    ? '<text x="150" y="215" text-anchor="middle" font-size="13" fill="#f9fafb" font-family="sans-serif">Imagem insuficiente</text>'
    : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
<defs><filter id="b"><feGaussianBlur stdDeviation="9"/></filter></defs>
<rect width="300" height="300" fill="${fundo}"/>
<g ${filtro}><ellipse cx="150" cy="140" rx="70" ry="92" fill="${rosto}"/>
<ellipse cx="124" cy="120" rx="9" ry="5" fill="#00000033"/><ellipse cx="176" cy="120" rx="9" ry="5" fill="#00000033"/>
<path d="M128 185 Q150 197 172 185" stroke="#00000044" stroke-width="4" fill="none"/></g>
<rect x="0" y="262" width="300" height="38" fill="#00000066"/>
<text x="12" y="287" font-size="15" fill="#fff" font-family="sans-serif">Foto fictícia ${rotulo}</text>
${aviso}
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
