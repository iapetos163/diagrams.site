import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { DiagramModel } from '../diagram-model';
import { getPlacements } from './placement';

export interface DiagramProps {
  model: DiagramModel;
  width?: number;
  height?: number;
}

type Offsets = Record<string, { dx: number; dy: number; length: number }>;

const objRadius = 10;
const arrowWidth = 5;
const colSize = 200;
const rowSize = 100;
const arrowOffsetRatio = 1.2;
const markerSize = 5;

export const Diagram: React.FC<DiagramProps> = ({
  model,
  width: givenWidth,
  height: givenHeight,
}) => {
  const {
    numCols,
    numRows,
    objects: objPlacements,
  } = useMemo(() => getPlacements(model), [model]);

  const viewWidth = useMemo(() => numCols * colSize, [numCols]);
  const viewHeight = useMemo(() => (numRows + 1) * rowSize, [numRows]);

  const { width, height, viewBox } = useMemo(() => {
    if (givenWidth === undefined && givenHeight === undefined) {
      return {
        width: viewWidth,
        height: viewHeight,
        viewBox: [0, 0, viewWidth, viewHeight].join(' '),
      };
    }
    const width = givenWidth ?? (givenHeight! * viewWidth) / viewHeight;
    const height = givenHeight ?? (givenWidth! * viewHeight) / viewWidth;

    const expHeight = (height * viewWidth) / width;
    const expWidth = (width * viewHeight) / height;

    if (expHeight > viewHeight) {
      const viewOffsetY = (height - expHeight) / 2;
      return {
        width,
        height,
        viewBox: [0, -viewOffsetY, viewWidth, expHeight - viewOffsetY].join(
          ' ',
        ),
      };
    }

    const viewOffsetX = (width - expWidth) / 2;
    return {
      width,
      height,
      viewBox: [-viewOffsetX, 0, expWidth - viewOffsetX, viewHeight].join(' '),
    };
  }, [givenWidth, givenHeight, viewWidth, viewHeight]);

  const colToX = useCallback((col: number) => (0.5 + col) * colSize, []);
  const rowToY = useCallback((row: number) => (1 + row) * rowSize, []);

  const arrowOffsets = useMemo(
    () =>
      model.morphisms.reduce<Offsets>((accum, morphism) => {
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
    [model, colToX, rowToY, objPlacements],
  );

  return (
    <StyledDiagram {...{ width, viewBox, height }}>
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

      {model.morphisms.map((morphism) => {
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
      {model.objects.map((obj) => {
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

export default Diagram;

const StyledDiagram = styled.svg<{ width: number; height: number }>`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  fill: black;
  background-color: white;
`;
