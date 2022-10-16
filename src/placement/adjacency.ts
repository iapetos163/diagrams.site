import { DEFAULT_ID } from '.';
import { Morphism, Obj } from '../diagram';

type Adjacencies = {
  [categoryId: string]: {
    [objectId: string]: string[];
  };
};

interface AdjacenciesResult {
  sources: Adjacencies;
  destinations: Adjacencies;
}

export const getObjectAdjacencies = (
  objects: Obj[],
  morphisms: Morphism[],
): AdjacenciesResult => {
  const sources: Adjacencies = {};
  const dests: Adjacencies = {};

  for (const { sourceId, destId, categoryId } of morphisms) {
    const catId = categoryId ?? DEFAULT_ID;
    if (!sources[catId]) {
      sources[catId] = { [destId]: [sourceId] };
    } else if (!sources[catId][destId]) {
      sources[catId][destId] = [sourceId];
    } else {
      sources[catId][destId].push(sourceId);
    }

    if (!dests[catId]) {
      dests[catId] = { [sourceId]: [destId] };
    } else if (!dests[catId][destId]) {
      dests[catId][sourceId] = [destId];
    } else {
      dests[catId][sourceId].push(destId);
    }
  }

  return {
    sources,
    destinations: dests,
  };
};
