import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import styled from 'styled-components';
import { makeColor } from './color';
import Diagram from './Diagram';
import { DiagramModel } from './diagram-model';

const sampleDiagram: DiagramModel = {
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
      name: '$\\alpha$',
      sourceId: 'a',
      destId: 'b',
    },
    {
      id: 'bd',
      quantification: 'GIVEN',
      name: '$\\beta$',
      sourceId: 'b',
      destId: 'd',
    },
    {
      id: 'ac',
      quantification: 'GIVEN',
      name: '$\\gamma$',
      sourceId: 'a',
      destId: 'c',
    },
    {
      id: 'cd',
      quantification: 'GIVEN',
      name: '$\\delta$',
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
        <ControlledColor {...{ pctHue, pctSat }}>diagrams.site</ControlledColor>
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
      <Diagram model={sampleDiagram} />
      <textarea></textarea>
    </>
  );
};

const ControlledColor = styled.span<{ pctHue: number; pctSat: number }>`
  color: ${({ pctHue, pctSat }) => makeColor(pctHue * 3.6, pctSat / 100).dark};
`;

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
