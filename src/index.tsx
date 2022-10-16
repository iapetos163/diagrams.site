import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { Diagram, RenderedDiagram } from './diagram';

/*
GIVEN OBJ 50% SAT 1 HUE
E OBJ 100% SAT 0 HUE
A OBJ 0% SAT 2 HUE
MORPHISM 1+a HUE
0~a+b

a=5;b=10
0~15

*/

// const hue2 = (hue: number ) => (hue + 120) % 360;

const smoothstep = (x: number) => 3 * x * x - 2 * x * x * x;

const absSatAndValue = (
  absHueDeg: number,
  relSat: number
): [number, number] => {
  let maxSat = 1;
  if (absHueDeg <= 60) {
    maxSat = 1 - 0.4 * smoothstep(absHueDeg / 60);
  } else if (absHueDeg < 120) {
    maxSat = 0.6 + 0.4 * smoothstep(absHueDeg / 60 - 1);
  }

  const absSat = (maxSat * (1 + relSat)) / 2;

  const yellowness = Math.abs(((absHueDeg + 300) % 360) - 180) / 180;

  const absValue = (2 - relSat * yellowness) / 4;

  return [absSat, absValue];
};

const formatDeg = (pct: number) => `${Math.round(pct * 3.5)}deg`;
const formatPct = (pct: number) => `${Math.round(pct * 100)}%`;

const sampleDiagram: Diagram = {
  id: 'sample',
  objects: [
    {
      id: 'a',
      name: 'A',
      quantification: 'GIVEN',
    },
    {
      id: 'b',
      name: 'B',
      quantification: 'GIVEN',
    },
    {
      id: 'c',
      name: 'C',
      quantification: 'GIVEN',
    },
    {
      id: 'd',
      name: 'D',
      quantification: 'GIVEN',
    },
  ],
  morphisms: [
    {
      id: 'ab',
      quantification: 'GIVEN',
      sourceId: 'a',
      destId: 'b',
    },
    {
      id: 'bd',
      quantification: 'GIVEN',
      sourceId: 'b',
      destId: 'd',
    },
    {
      id: 'ac',
      quantification: 'GIVEN',
      sourceId: 'a',
      destId: 'c',
    },
    {
      id: 'cd',
      quantification: 'GIVEN',
      sourceId: 'c',
      destId: 'd',
    },
  ],
  categories: [],
  functors: [],
  functorMappings: [],
};

const App = () => {
  const [pctHue, setPctHue] = useState(0);
  const [pctSat, setPctSat] = useState(100);

  return (
    <>
      <a href="https://example.com" target="_blank" rel="noreferrer"></a>
      <h1>
        <ControlledColor {...{ pctHue, pctSat }}></ControlledColor>diagrams.site
      </h1>
      <input
        type="range"
        value={pctHue}
        onChange={(e) => setPctHue(e.target.valueAsNumber)}
      ></input>
      <input
        type="range"
        value={pctSat}
        onChange={(e) => setPctSat(e.target.valueAsNumber)}
      ></input>
      <RenderedDiagram diagram={sampleDiagram} />
      <textarea></textarea>
    </>
  );
};

const ControlledColor = styled.span<{ pctHue: number; pctSat: number }>`
  ${({ pctHue, pctSat }) => {
    const [sat, val] = absSatAndValue(pctHue * 3.6, pctSat / 100);
    return `color: hsl(${formatDeg(pctHue)}, ${formatPct(sat)}, ${formatPct(
      val / 2
    )})`;
  }}
`;

ReactDOM.render(<App />, document.getElementById('root'));
