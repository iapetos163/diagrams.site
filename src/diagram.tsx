import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { getPlacements } from './placement';

export type Quantification = 'GIVEN' | 'EXISTS' | 'FORALL' | 'UNIQUE';
export type MorphismProperty = 'EPIC' | 'MONIC';

export interface Category {
  id: string;
  name?: string;
}

export interface Obj {
  id: string;
  name?: string;
  quantification: Quantification;
  /** Required if in diagram with categories.length > 0 */
  categoryId?: string;
}

export interface Morphism {
  id: string;
  name?: string;
  quantification: Quantification;
  sourceId: string;
  destId: string;
  /** Required if in diagram with categories.length > 0 */
  categoryId?: string;
  property?: MorphismProperty;
}

export interface Functor {
  id: string;
  name?: string;
  /** Required if in diagram with categories.length > 0 */
  sourceCategoryId?: string;
  /** Required if in diagram with categories.length > 0 */
  destCategoryId?: string;
}

export interface FunctorMapping {
  type: 'object' | 'morphism';
  /** Required if in a diagram with functors.length > 0 */
  functorId?: string;
  sourceId: string;
  destId: string;
}

export interface Diagram {
  id: string;
  categories: Category[];
  objects: Obj[];
  morphisms: Morphism[];
  functors: Functor[];
  functorMappings: FunctorMapping[];
}

export interface RenderedDiagramProps {
  diagram: Diagram;
}

const objRadius = 10;
const colSize = 200;
const rowSize = 100;

export const RenderedDiagram: React.FC<RenderedDiagramProps> = ({
  diagram,
}) => {
  const {
    numCols,
    numRows,
    objects: objPlacements,
  } = useMemo(() => getPlacements(diagram), [diagram]);

  const width = useMemo(() => numCols * colSize, [numCols]);
  const height = useMemo(() => (numRows + 1) * rowSize, [numRows]);

  // const colToX = useCallback(
  //   (col: number) => ((col + 1) * width) / (numCols + 1),
  //   [numCols],
  // );
  // const rowToY = useCallback(
  //   (row: number) => ((row + 1) * height) / (numRows + 1),
  //   [numRows],
  // );
  const colToX = useCallback((col: number) => (0.5 + col) * colSize, []);
  const rowToY = useCallback((row: number) => (1 + row) * rowSize, []);

  return (
    <StyledDiagram viewBox={`0 0 ${width} ${height}`} {...{ width, height }}>
      {diagram.objects.map((obj) => {
        const [col, row] = objPlacements[obj.id];
        return (
          <circle
            key={obj.id}
            cx={colToX(col)}
            cy={rowToY(row)}
            r={objRadius}
          />
        );
      })}
    </StyledDiagram>
  );
};

const StyledDiagram = styled.svg<{ width: number; height: number }>`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  fill: black;
  background-color: white;
`;
