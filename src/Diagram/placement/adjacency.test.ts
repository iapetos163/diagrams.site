import { getObjectAdjacencies } from './adjacency';
import { DEFAULT_ID } from '.';
import { Morphism, Obj } from '../../diagram-model';

const objects: Obj[] = [
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
];
const morphisms: Morphism[] = [
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
];

describe('getObjectAdjacencies', () => {
  it('Correctly computes adjacencies', () => {
    const { sources, destinations } = getObjectAdjacencies(objects, morphisms);
    expect(sources[DEFAULT_ID]['b']).toHaveLength(1);
    expect(sources[DEFAULT_ID]['b']).toContain('a');

    expect(sources[DEFAULT_ID]['c']).toHaveLength(1);
    expect(sources[DEFAULT_ID]['c']).toContain('a');

    expect(sources[DEFAULT_ID]['d']).toHaveLength(2);
    expect(sources[DEFAULT_ID]['d']).toContain('b');
    expect(sources[DEFAULT_ID]['d']).toContain('c');

    expect(destinations[DEFAULT_ID]['a']).toHaveLength(2);
    expect(destinations[DEFAULT_ID]['a']).toContain('b');
    expect(destinations[DEFAULT_ID]['a']).toContain('c');

    expect(destinations[DEFAULT_ID]['b']).toHaveLength(1);
    expect(destinations[DEFAULT_ID]['b']).toContain('d');

    expect(destinations[DEFAULT_ID]['c']).toHaveLength(1);
    expect(destinations[DEFAULT_ID]['c']).toContain('d');
  });
});
