import { DEFAULT_ID } from '.';
import { Morphism, Obj } from '../../diagram-model';

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

  for (const { id, categoryId } of objects) {
    const catId = categoryId ?? DEFAULT_ID;
    if (!sources[catId]) {
      sources[catId] = { [id]: [] };
    } else if (!sources[catId][id]) {
      sources[catId][id] = [];
    }

    if (!dests[catId]) {
      dests[catId] = { [id]: [] };
    } else if (!dests[catId][id]) {
      dests[catId][id] = [];
    }
  }

  for (const { sourceId, destId, categoryId } of morphisms) {
    const catId = categoryId ?? DEFAULT_ID;
    sources[catId][destId].push(sourceId);
    dests[catId][sourceId].push(destId);
  }

  return {
    sources,
    destinations: dests,
  };
};
