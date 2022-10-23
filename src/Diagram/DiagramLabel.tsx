import React, { useEffect, useMemo, useRef } from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

export interface DiagramLabelProps {
  text: string;
}

const mathRe = /^\$(.+)\$$/;

export const DiagramLabel: React.FC<DiagramLabelProps> = ({ text }) => {
  const match = useMemo(() => mathRe.exec(text), [text]);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (targetRef.current && match) {
      katex.render(match[1], targetRef.current, {
        throwOnError: false,
      });
    }
  }, [targetRef, match]);

  if (!match) return <>{text}</>;

  return <div ref={targetRef} />;
};

export default DiagramLabel;
