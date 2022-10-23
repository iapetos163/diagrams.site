import React, { HTMLAttributes, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { DiagramModel } from '../diagram-model';
import DiagramLabel from './DiagramLabel';
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
const arrowOffsetRatio = 1.3;
const markerSize = 4;

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

  const { width, height } = useMemo(() => {
    if (givenWidth === undefined && givenHeight === undefined) {
      return {
        width: viewWidth,
        height: viewHeight,
      };
    }
    const width = givenWidth ?? (givenHeight! * viewWidth) / viewHeight;
    const height = givenHeight ?? (givenWidth! * viewHeight) / viewWidth;

    return {
      width,
      height,
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
    <StyledDiagram {...{ width, height }}>
      <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
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
      </svg>
      {model.objects.map((obj) => {
        if (!obj.name) return null;
        const [col, row] = objPlacements[obj.id];
        return (
          <div
            key={obj.id}
            style={{
              right: width - colToX(col) + objRadius,
              bottom: height - rowToY(row) + objRadius,
            }}
          >
            <DiagramLabel text={obj.name} />
          </div>
        );
      })}
      {model.morphisms.map((morphism) => {
        if (!morphism.name) return null;
        const [srcCol, srcRow] = objPlacements[morphism.sourceId];
        // const [destCol] = objPlacements[morphism.destId];
        const { dx, dy, length } = arrowOffsets[morphism.id];
        const x = colToX(srcCol) + dx / 2 + (arrowWidth * dy) / length;
        const y = rowToY(srcRow) + dy / 2 - (arrowWidth * dx) / length;
        // const xBuffer = Math.min(x, width - x);
        const style: HTMLAttributes<HTMLDivElement>['style'] = {};
        // if (dx / length === 1) {
        //   style.left = x - xBuffer * dx / length;
        //   style.right = width - x - xBuffer;
        // } else {
        if (dy > 0) {
          style.left = x;
        } else {
          style.right = width - x;
        }
        // }
        if (dx > 0) {
          style.bottom = height - y;
        } else {
          style.top = y;
        }

        return (
          <div key={morphism.id} style={style}>
            <DiagramLabel text={morphism.name} />
          </div>
        );
      })}
    </StyledDiagram>
  );
};

export default Diagram;

const StyledDiagram = styled.div<{ width: number; height: number }>`
  border: 1px solid black;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  position: relative;
  > svg {
    fill: black;
  }
  > div {
    position: absolute;
    text-align: center;
  }
`;
