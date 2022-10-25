import { getPlacements } from '.';
import { emptyDiagram } from '../../diagram-model';

describe('getObjectAdjacencies', () => {
  it('Correctly computes adjacencies', () => {
    const { numCols, numRows } = getPlacements({
      ...emptyDiagram,
      objects: [
        {
          id: 'a',
          quantification: 'GIVEN',
        },
      ],
    });

    expect(numCols).toBe(1);
    expect(numRows).toBe(1);
  });
});
