import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { makeColorScheme } from './color';
import Diagram from './Diagram';
import { DiagramModel, emptyDiagram } from './diagram-model';
import SpecInput from './SpecInput';
import './style.css';

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
  const [diagram, setDiagram] = useState(emptyDiagram);
  const colorScheme = useMemo(() => makeColorScheme(diagram), [diagram]);

  const onDiagramChange = (diagram: DiagramModel) => setDiagram(diagram);

  return (
    <>
      <h1>diagrams.site</h1>
      <Diagram model={diagram} colorScheme={colorScheme} />
      <SpecInput onDiagramChange={onDiagramChange} />
    </>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
