import React from 'react';

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
  categoryId: string;
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

interface SortingStruct {
  [categoryId: string]: {
    [objectId: string]: string[];
  };
}

interface FirstTiersByCat {
  [categoryId: string]: {
    objects: Obj[];
    numInbound: number;
  };
}

interface IntermediateTiering {
  tiers: {
    [objectId: string]: number;
  };
  longestPath: number;
  partitionId: number;
  nextToVisit: string[];
}

interface TentativeTierings {
  [categoryId: string]: {
    tierings: IntermediateTiering[];
    partitions: {
      [objectId: string]: number;
    };
  };
}

interface Tiering {
  tiersByObject: {
    [objectId: string]: number;
  };
  longestPath: number;
  partitionId: number;
  largestTierSize: number;
  objectsByTier: {
    [tierId: number]: string[];
  };
}

interface ActualTierings {
  [categoryId: string]: {
    [partitionId: number]: Tiering;
  };
}

const continueWalking = (tt: TentativeTierings) =>
  Object.values(tt).some(({ tierings }) =>
    tierings.some(({ nextToVisit }) => nextToVisit.length > 0));

const DEFAULT_ID = 'ambient';

const sortStuff = ({ morphisms, objects }: Diagram) => {
  // Get mappings of object sources and destinations

  const sourcesForObjects: SortingStruct = {}; 
  const destsForObjects: SortingStruct = {};

  for (const { sourceId, destId, categoryId } of morphisms) {
    const catId = categoryId ?? DEFAULT_ID;
    if (! sourcesForObjects[catId]) {
      sourcesForObjects[catId] = { [destId]: [sourceId] };
    } else if (!sourcesForObjects[catId][destId]) {
      sourcesForObjects[catId][destId] = [sourceId];
    } else {
      sourcesForObjects[catId][destId].push(sourceId);
    }

    if (! destsForObjects[catId]) {
      destsForObjects[catId] = { [sourceId]: [destId] };
    } else if (!destsForObjects[catId][destId]) {
      destsForObjects[catId][sourceId] = [destId];
    } else {
      destsForObjects[catId][sourceId].push(destId);
    }
  }

  /*
  We want to assign a "tier" to each object, which is an n >= 0 such that
  any given path in the graph tends to increase n.
  Since the graph may be cyclic it's impossible to guarantee,
  But we can get something close by assigning tiers based on a longest path
  */

  const numInbound = (catId: string, obj: Obj) => {
    if (!sourcesForObjects[catId]) return 0;
    return sourcesForObjects[catId][obj.id]?.length ?? 0;
  };
  const objectsByCategory: { [catId: string]: Obj[] } = {};

  // Find *candidates* for tier-0 objects using the heuristic of objects with the fewest inbound arrows
  const firstTierObjects = objects.reduce<FirstTiersByCat>((accum, obj) => {
    const catId = obj.categoryId ?? DEFAULT_ID;
    const n = numInbound(catId, obj);
    if (!objectsByCategory[catId]) {
      objectsByCategory[catId] = [obj];
      return {
        ...accum,
        [catId]: {
          objects: [obj],
          numInbound: n,
        },
      };
    }
    objectsByCategory[catId].push(obj);

    if (n > accum[catId].numInbound) return accum;

    if (n < accum[catId].numInbound) return {
      ...accum,
      [catId]: {
        objects: [obj],
        numInbound: n,
      },
    };
    
    accum[catId].objects.push(obj);
    return accum;
  }, {});

  // For each candidate tier-0 object, find the longest path.
  // While we're at it, determine how objects are partitioned

  // Initialize struct for graph walking
  const tentativeTierings = Object.entries(firstTierObjects).reduce<TentativeTierings>((accum, [catId, firstTier]) => ({
    ...accum,
    [catId]: {
      tierings: firstTier.objects.map((firstObj, i) => ({
        partitionId: i,
        tiers: {
          [firstObj.id]: 0,
        },
        longestPath: 0,
        nextToVisit: [firstObj.id],
      })),
      partitions: firstTier.objects.reduce((accum, obj, i) => ({
        ...accum,
        [obj.id]: i,
      }), {}),
    },
  }), {});


  while (continueWalking(tentativeTierings)) {
    for (const [catId, { tierings, partitions }] of Object.entries(tentativeTierings)) {
      const reAssignPartitionIds = (oldId: number, newId: number) => {
        for (const [objId, p] of Object.entries(partitions)) {
          if (p === oldId) {
            partitions[objId] = newId;
          }
        }
      };

      for (const tiering of tierings) {
        const filteredNext = tiering.nextToVisit.filter(objId => tiering.tiers[objId] === undefined);
        if (filteredNext.length === 0) return;

        // Increment longest path
        tiering.longestPath += 1;

        // Assign object tiers
        for (const objId of filteredNext) {
          tiering.tiers[objId] = tiering.longestPath;
        }

        // Determine partition
        // If we discover that two partitions are actually the same,
        // we choose the smallest as the new "actual" partition ID
        for (const objId of filteredNext) {
          if (partitions[objId] === undefined) {
            partitions[objId] = tiering.partitionId;
            continue;
          }
          if (partitions[objId] === tiering.partitionId) continue;

          if (partitions[objId] > tiering.partitionId) {
            reAssignPartitionIds(partitions[objId], tiering.partitionId);
            continue;
          }

          reAssignPartitionIds(tiering.partitionId, partitions[objId]);
          tiering.partitionId = partitions[objId];
        }

        // Get not-yet-visited objects for next step
        tiering.nextToVisit = filteredNext.reduce<string[]>((nextIds, prevId) => {
          const dests = destsForObjects[catId][prevId] ?? [];
          const filteredDests = dests.filter(objId => tiering.tiers[objId] === undefined);
          return nextIds.concat(filteredDests);
        }, []);
      }
    }
  }

  // For each partition, choose the tiering based on the longest path,
  // and assign all objects tiers based on that

  let globalLargestTierSize = 1;
  let globalSecondLargestTierSize = 0;

  const tierings = Object.entries(tentativeTierings).reduce<ActualTierings>((accum, [catId, { tierings: tentative, partitions }]) => {
    /*
    Recursively assign object tiers as one less than the smallest tier of the objects destinations
    The function will always terminate because it tracks visited objects
    If there is a path *to* a tiered object, it will return finite n >= 0
      n can't be negative as long as the tiering is based on the longest path in the partition
    If there is a path *from* a tiered object, it should have already been tiered in the graph walk above
    If there is no path to a tiered object, they must be in separate partitions
    */
    const getAndAssignTier = (t: IntermediateTiering, objId: string, visited = new Set<string>()): number => {
      visited.add(objId);
      const assignedTier = t.tiers[objId];
      if (assignedTier !== undefined) return assignedTier;
      const dests = destsForObjects[catId][objId].filter(d => !visited.has(d));
      const minDestTier = dests.reduce((min, dest) => {
        const destTier = getAndAssignTier(t, dest, visited);
        if (destTier < min) return destTier;
        return min;
      }, Infinity);
      return minDestTier - 1;
    };

    const selectedTierings = Object.values(partitions).reduce<{ [partId: number]: IntermediateTiering }>((a, p) => ({
      ...a,
      [p]: tentative.reduce((a, b) => b.partitionId === p && (a.partitionId !== p || b.longestPath > a.longestPath) ? b : a),
    }), {});

    for (const obj of firstTierObjects[catId].objects) {
      const t = selectedTierings[partitions[obj.id]];
      getAndAssignTier(t, obj.id);
    }
    
    return {
      ...accum,
      [catId]: Object.entries(selectedTierings).reduce<{ [partId: number]: Tiering }>((a, [p, tiering]) => {
        let largestTierSize = 1;
        const objectsByTier: { [tier: number]: string[] } = {};
  
        for (const [objId, tier] of Object.entries(tiering.tiers)) {
          if (!objectsByTier[tier]) {
            objectsByTier[tier] = [objId];
            continue;
          }
          objectsByTier[tier].push(objId);
          if (objectsByTier[tier].length > largestTierSize) {
            largestTierSize = objectsByTier[tier].length;
            if (largestTierSize > globalLargestTierSize) {
              globalSecondLargestTierSize = globalLargestTierSize;
              globalLargestTierSize = largestTierSize;
            }
          }
        }
  
        return {
          ...a,
          [p]: {
            ...tiering,
            tiersByObject: tiering.tiers,
            largestTierSize,
            objectsByTier,
          },
        };
      }, {}),
    };
  }, {});

  const numRows = globalSecondLargestTierSize + 1;

  // TODO: assign affinities
};


export const RenderedDiagram: React.FC<RenderedDiagramProps> = ({ diagram }) => {

  return (
    <svg>
    </svg>
  );
};
