import { useState, useEffect, useRef } from "react";
import { useInView } from "../../hooks/useInView";

export function Counter({ end, suffix = "", duration = 2000 }) {
  const [val, setVal] = useState(0);
  const [ref, inView] = useInView(0.5);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    let cur = 0;
    const step = end / (duration / 16);
    const id = setInterval(() => {
      cur += step;
      if (cur >= end) { setVal(end); clearInterval(id); }
      else setVal(Math.floor(cur));
    }, 16);
    return () => clearInterval(id);
  }, [inView, end, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}
