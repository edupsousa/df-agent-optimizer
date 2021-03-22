import * as d3 from "d3";
import { useEffect, useRef } from "react";

export default function useD3<TContainerElement extends Element>(
  renderFn: (
    container: d3.Selection<TContainerElement, unknown, null, undefined>
  ) => () => void
) {
  const ref = useRef<TContainerElement | null>(null);
  useEffect(() => {
    if (ref.current !== null) {
      return renderFn(d3.select(ref.current));
    }
    return () => {};
  }, [renderFn]);
  return ref;
}
