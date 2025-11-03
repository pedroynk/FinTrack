import { useEffect } from "react";

export function usePageResizePing(target?: HTMLElement | null) {
  useEffect(() => {
    // ping rápido pós-montagem + após animações de menu
    const t1 = setTimeout(() => window.dispatchEvent(new Event("resize")), 40);
    const t2 = setTimeout(() => window.dispatchEvent(new Event("resize")), 200);
    const t3 = setTimeout(() => window.dispatchEvent(new Event("resize")), 400);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && target) {
      ro = new ResizeObserver(() => {
        window.dispatchEvent(new Event("resize"));
      });
      ro.observe(target);
    }
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      ro?.disconnect();
    };
  }, [target]);
}
