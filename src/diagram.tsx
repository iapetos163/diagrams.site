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

type Offsets = Record<string, { dx: number; dy: number; length: number }>;

const objRadius = 10;
const arrowWidth = 5;
const colSize = 200;
const rowSize = 100;
const arrowOffsetRatio = 1.2;
const markerSize = 5;

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

  const colToX = useCallback((col: number) => (0.5 + col) * colSize, []);
  const rowToY = useCallback((row: number) => (1 + row) * rowSize, []);

  const arrowOffsets = useMemo(
    () =>
      diagram.morphisms.reduce<Offsets>((accum, morphism) => {
        const [srcCol, srcRow] = objPlacements[morphism.sourceId];
        const [destCol, destRow] = objPlacements[morphism.destId];
        const dx = colToX(destCol) - colToX(srcCol);
        const dy = rowToY(destRow) - rowToY(srcRow);
        const length = Math.sqrt(dx * dx + dy * dy);
        return {
          ...accum,
          [morphism.id]: { dx, dy, length },
        };
      }, {}),
    [diagram, colToX, rowToY, objPlacements],
  );

  return (
    <StyledDiagram viewBox={`0 0 ${width} ${height}`} {...{ width, height }}>
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth={markerSize}
          markerHeight={markerSize}
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>

      {diagram.morphisms.map((morphism) => {
        const [srcCol, srcRow] = objPlacements[morphism.sourceId];
        const [destCol, destRow] = objPlacements[morphism.destId];
        const { dx, dy, length } = arrowOffsets[morphism.id];
        const srcOffsetLength = arrowOffsetRatio * objRadius;
        const destOffsetLength =
          arrowOffsetRatio * objRadius + (markerSize * arrowWidth) / 2;
        const x1 = colToX(srcCol) + (srcOffsetLength * dx) / length;
        const y1 = rowToY(srcRow) + (srcOffsetLength * dy) / length;
        const x2 = colToX(destCol) - (destOffsetLength * dx) / length;
        const y2 = rowToY(destRow) - (destOffsetLength * dy) / length;

        return (
          <line
            key={morphism.id}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            strokeWidth={arrowWidth}
            fill="none"
            stroke="black"
            markerEnd="url(#arrow)"
          />
        );
      })}
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
