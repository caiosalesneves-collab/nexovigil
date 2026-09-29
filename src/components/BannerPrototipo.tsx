// Banner obrigatório em todas as telas (regra 2 do CLAUDE.md).
export function BannerPrototipo() {
  return (
    <div
      role="note"
      className="sticky top-0 z-50 bg-amber-100 border-b border-amber-300 px-4 py-2 text-center text-sm font-medium text-amber-900"
    >
      Protótipo demonstrativo com dados fictícios. Não utilizar para decisões clínicas.
    </div>
  )
}
