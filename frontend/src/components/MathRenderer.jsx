import { useEffect, useRef } from "react";
import renderMathInElement from "katex/contrib/auto-render";

const MathRenderer = ({ content }) => {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      renderMathInElement(ref.current, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
    }
  }, [content]);

  return (
    <div ref={ref} style={{ whiteSpace: "pre-line" }}>
      {content}
    </div>
  );
};

export default MathRenderer;