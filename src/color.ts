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

const absSatAndValue = (
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

export const makeColor = (absHueDeg: number, relSat: number): ColorPair => {
  const [sat, val] = absSatAndValue(absHueDeg, relSat);
  const hsl = [`${absHueDeg}deg`, formatPct(sat), formatPct(val / 2)];

  return {
    dark: `hsl(${hsl.join(', ')})`,
    bright: 'red',
  };
};

const formatDeg = (pct: number) => `${Math.round(pct * 3.5)}deg`;
const formatPct = (pct: number) => `${Math.round(pct * 100)}%`;
