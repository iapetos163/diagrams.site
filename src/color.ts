import { DiagramModel } from './diagram-model';

export interface ColorPair {
  dark: string;
  bright: string;
}

export interface ColorScheme {
  categories: Record<string, ColorPair>;
  objects: Record<string, ColorPair>;
  morphisms: Record<string, ColorPair>;
  functorMappings: Record<string, ColorPair>;
}

/*
GIVEN OBJ 50% SAT 1 HUE
E OBJ 100% SAT 0 HUE
A OBJ 0% SAT 2 HUE
MORPHISM 1+a HUE
0~a+b

a=5;b=10
0~15

*/

// const hue2 = (hue: number ) => (hue + 120) % 360;

const smoothstep = (x: number) => 3 * x * x - 2 * x * x * x;

const formatDeg = (pct: number) => `${Math.round(pct * 3.5)}deg`;
const formatPct = (pct: number) => `${Math.round(pct * 100)}%`;

const darkAbsSatAndValue = (
  absHueDeg: number,
  relSat: number,
): [number, number] => {
  let maxSat = 1;
  if (absHueDeg <= 60) {
    maxSat = 1 - 0.4 * smoothstep(absHueDeg / 60);
  } else if (absHueDeg < 120) {
    maxSat = 0.6 + 0.4 * smoothstep(absHueDeg / 60 - 1);
  }

  const absSat = (maxSat * (1 + relSat)) / 2;

  const yellowness = Math.abs(((absHueDeg + 300) % 360) - 180) / 180;

  const absValue = (2 - relSat * yellowness) / 4;

  return [absSat, absValue];
};

const brightAbsSatAndValue = (relSat: number): [number, number] => {
  const absSat = (0.9 * (1 + relSat)) / 2;

  const absValue = 0.9;

  return [absSat, absValue];
};

export const makeColor = (absHueDeg: number, relSat: number): ColorPair => {
  const [darkSat, darkVal] = darkAbsSatAndValue(absHueDeg, relSat);
  const darkHsl = [
    `${absHueDeg}deg`,
    formatPct(darkSat),
    formatPct(darkVal / 2),
  ];
  const [brightSat, brightVal] = brightAbsSatAndValue(relSat);
  const brightHsl = [
    `${Math.round(absHueDeg)}deg`,
    formatPct(brightSat),
    formatPct(brightVal / 2),
  ];

  return {
    dark: `hsl(${darkHsl.join(', ')})`,
    bright: `hsl(${brightHsl.join(', ')})`,
  };
};

export const makeColorScheme = (diagram: DiagramModel): ColorScheme => {
  const hasCat = diagram.functors.length > 0;
  const numSlices = Math.max(diagram.categories.length + (hasCat ? 1 : 0), 3);
  const sliceSize = 360 / numSlices;
  const catSliceIndices = diagram.categories.reduce<Record<string, number>>(
    (accum, cat, i) => ({
      ...accum,
      [cat.id]: i,
    }),
    {},
  );

  const catOffset = (catId?: string) =>
    240 + (catId ? catSliceIndices[catId] : 0) * sliceSize;

  return {
    categories: diagram.categories.reduce((accum, cat) => {
      const absHue = (catOffset(cat.id) + sliceSize / 15) % 360;
      return {
        [cat.id]: makeColor(absHue, 0.5),
        ...accum,
      };
    }, {}),
    objects: diagram.objects.reduce((accum, obj) => {
      let objOffset: number;
      let relSat: number;
      switch (obj.quantification) {
        case 'EXISTS':
        case 'UNIQUE':
          objOffset = 0;
          relSat = 1;
          break;
        case 'FORALL':
          objOffset = (2 * sliceSize) / 15;
          relSat = 0;
          break;
        default:
          objOffset = sliceSize / 15;
          relSat = 0.5;
      }

      const absHue = (catOffset(obj.categoryId) + objOffset) % 360;
      return {
        [obj.id]: makeColor(absHue, relSat),
        ...accum,
      };
    }, {}),
    morphisms: diagram.morphisms.reduce((accum, morphism) => {
      let mOffset: number;
      let relSat: number;
      switch (morphism.quantification) {
        case 'EXISTS':
        case 'UNIQUE':
          mOffset = (5 * sliceSize) / 15;
          relSat = 1;
          break;
        case 'FORALL':
          mOffset = (7 * sliceSize) / 15;
          relSat = 0;
          break;
        default:
          mOffset = (6 * sliceSize) / 15;
          relSat = 0.5;
      }

      const absHue = (catOffset(morphism.categoryId) + mOffset) % 360;
      return {
        [morphism.id]: makeColor(absHue, relSat),
        ...accum,
      };
    }, {}),
    functorMappings: diagram.functorMappings.reduce((accum, mapping) => {
      const mOffset = (6 * sliceSize) / 15;
      const relSat = 0.5;

      const absHue = (240 + (numSlices - 1) * sliceSize + mOffset) % 360;
      return {
        [mapping.id]: makeColor(absHue, relSat),
        ...accum,
      };
    }, {}),
  };
};
