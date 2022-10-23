import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import styled from 'styled-components';
import { makeColor, makeColorScheme } from './color';
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

const colorScheme = makeColorScheme(sampleDiagram);

const App = () => {
  const [pctHue, setPctHue] = useState(0);
  const [pctSat, setPctSat] = useState(100);

  return (
    <>
      <h1>diagrams.site</h1>
      <ControlledColor {...{ pctHue, pctSat }}>
        <div style={{ width: 100, height: 200 }} />
      </ControlledColor>
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
      <Diagram model={sampleDiagram} colorScheme={colorScheme} />
      <textarea></textarea>
    </>
  );
};

const ControlledColor = styled.div<{ pctHue: number; pctSat: number }>`
  background-color: ${({ pctHue, pctSat }) =>
    makeColor(pctHue * 3.6, pctSat / 100).bright};
`;

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
