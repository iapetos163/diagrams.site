import React, { HTMLAttributes, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { ColorScheme } from '../color';
import { DiagramModel } from '../diagram-model';
import DiagramLabel from './DiagramLabel';
import { getPlacements } from './placement';

export interface DiagramProps {
  model: DiagramModel;
  colorScheme?: ColorScheme;
  width?: number;
  height?: number;
}

const objRadius = 10;
const arrowWidth = 5;
const colSize = 200;
const rowSize = 100;
const arrowOffsetRatio = 1.3;
const markerSize = 4;

export const Diagram: React.FC<DiagramProps> = ({
  model,
  colorScheme,
  width: givenWidth,
  height: givenHeight,
}) => {
  const {
    numCols,
    numRows,
    objects: objPlacements,
    arrows: arrowPlacements,
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

  return (
    <StyledDiagram {...{ width, height }}>
      <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
        {model.objects.map((obj) => {
          const [col, row] = objPlacements[obj.id];
          const style: HTMLAttributes<SVGCircleElement>['style'] = {};
          if (colorScheme) {
            style.fill = colorScheme.objects[obj.id].dark;
          }
          return (
            <circle
              key={obj.id}
              cx={colToX(col)}
              cy={rowToY(row)}
              r={objRadius}
              style={style}
            />
          );
        })}
        {model.morphisms.map((morphism) => {
          const [srcCol, srcRow] = objPlacements[morphism.sourceId];
          const { length, angle } = arrowPlacements[morphism.id];
          const srcOffsetLength = arrowOffsetRatio * objRadius;

          const totalOffsetLength =
            arrowOffsetRatio * objRadius + (markerSize * arrowWidth) / 2;

          let color: string | undefined;
          if (colorScheme) {
            color = colorScheme.morphisms[morphism.id].dark;
          }

          return (
            <StyledArrow
              arrowColor={color}
              arrowWidth={arrowWidth}
              key={morphism.id}
              transform={`translate(${colToX(srcCol)}, ${rowToY(srcRow)})`}
            >
              <g transform={`rotate(${(angle * 180) / Math.PI})`}>
                <line
                  x1={srcOffsetLength}
                  y1={0}
                  x2={length * colSize - totalOffsetLength}
                  y2={0}
                />
                <g
                  transform={`translate(${
                    length * colSize - totalOffsetLength
                  }, 0)`}
                >
                  <g transform={`scale(${(markerSize * arrowWidth) / 10})`}>
                    <path d="M -5 -5 L 5 0 L -5 5 z" />
                  </g>
                </g>
              </g>
            </StyledArrow>
          );
        })}
      </svg>
      {model.objects.map((obj) => {
        if (!obj.name) return null;
        const [col, row] = objPlacements[obj.id];

        const style: HTMLAttributes<HTMLDivElement>['style'] = {
          right: width - colToX(col) + objRadius,
          bottom: height - rowToY(row) + objRadius,
        };
        if (colorScheme) {
          style.color = colorScheme.objects[obj.id].dark;
        }

        return (
          <div key={obj.id} style={style}>
            <DiagramLabel text={obj.name} quantification={obj.quantification} />
          </div>
        );
      })}
      {model.morphisms.map((morphism) => {
        if (!morphism.name) return null;
        const [srcCol, srcRow] = objPlacements[morphism.sourceId];
        // const [destCol] = objPlacements[morphism.destId];
        const { dx, dy, length } = arrowPlacements[morphism.id];
        const x =
          colToX(srcCol) + (dx * colSize) / 2 + (arrowWidth * dy) / length;
        const y =
          rowToY(srcRow) + (dy * colSize) / 2 - (arrowWidth * dx) / length;
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

        if (colorScheme) {
          style.color = colorScheme.morphisms[morphism.id].dark;
        }

        return (
          <div key={morphism.id} style={style}>
            <DiagramLabel
              text={morphism.name}
              quantification={morphism.quantification}
            />
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
  > div {
    position: absolute;
    text-align: center;
  }
`;

const StyledArrow = styled.g<{ arrowColor?: string; arrowWidth: number }>`
  line {
    stroke-width: ${arrowWidth};
    stroke: ${({ arrowColor = 'black' }) => arrowColor};
  }
  path {
    fill: ${({ arrowColor = 'black' }) => arrowColor};
  }
`;
