/**
 * Lleva la atención a un panel: lo desplaza a la vista, opcionalmente le da foco y hace un breve destello.
 * Es la «acción recomendada» de tipo enfoque del Analysis Assistant: no cambia datos ni estado de misión.
 */
export function spotlight(id: string, color: string, opts: { focus?: boolean } = {}): void {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  if (opts.focus) el.focus({ preventScroll: true });
  if (!reduce && typeof el.animate === 'function') {
    el.animate(
      [{ boxShadow: `inset 0 0 0 0 ${color}` }, { boxShadow: `inset 0 0 0 3px ${color}`, offset: 0.25 }, { boxShadow: `inset 0 0 0 0 ${color}` }],
      { duration: 1800, easing: 'ease-out' },
    );
  }
}
