// Decorative CSS motion only; no transport, gameplay, timers or animation engine.
export function attachTitleEffects(root:HTMLElement):()=>void {
  const controller=new AbortController();
  const visibility=()=>root.dataset.titleVisible=String(!document.hidden);
  document.addEventListener('visibilitychange',visibility,{signal:controller.signal});visibility();
  return ()=>controller.abort();
}
