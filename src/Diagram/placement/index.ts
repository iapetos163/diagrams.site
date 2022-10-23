import { Obj, DiagramModel } from '../../diagram-model';
import { getObjectAdjacencies } from './adjacency';

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
  categoryId: string;
  tierings: IntermediateTiering[];
  partitions: {
    [objectId: string]: number;
  };
}

interface Tiering {
  objectsByTier: {
    [tierId: number]: string[];
  };
  longestPath: number;
  largestTier: number;
  largestTierSize: number;
  // secondLargestTier: number | undefined;
  // rowsNeeded: number;
}

interface ActualTierings {
  categoryId: string;
  catTierings: Tiering[];
}

/** local top is always 0 */
interface LocalPlacements {
  left: number;
  numRows: number;
  numCols: number;
  placements: { objId: string; col: number; row: number }[];
}

export interface Placements {
  /** column, row */
  objects: {
    [objectId: string]: [number, number];
  };
  /** left, top, right, bottom */
  categories: {
    [categoryId: string]: [number, number, number, number];
  };
  arrows: {
    [morphismId: string]: {
      dx: number;
      dy: number;
      length: number;
      angle: number;
    };
  };
  numRows: number;
  numCols: number;
}

const continueWalking = (tt: TentativeTierings[]) =>
  tt.some(({ tierings }) =>
    tierings.some(({ nextToVisit }) => nextToVisit.length > 0),
  );

export const DEFAULT_ID = 'ambient';

export const getPlacements = ({
  morphisms,
  objects,
}: DiagramModel): Placements => {
  // Get mappings of object sources and destinations
  const { sources: sourcesForObjects, destinations: destsForObjects } =
    getObjectAdjacencies(objects, morphisms);

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

    if (n < accum[catId].numInbound)
      return {
        ...accum,
        [catId]: {
          objects: [obj],
          numInbound: n,
        },
      };

    accum[catId].objects.push(obj);
    return accum;
  }, {});
  console.debug('firstTierObjects', firstTierObjects);

  // For each candidate tier-0 object, find the longest path.
  // While we're at it, determine how objects are partitioned

  // Initialize struct for graph walking
  const tentativeTierings = Object.entries(firstTierObjects).reduce<
    TentativeTierings[]
  >(
    (accum, [catId, firstTier]) => [
      ...accum,
      {
        categoryId: catId,
        tierings: firstTier.objects.map((firstObj, i) => ({
          partitionId: i,
          tiers: {
            [firstObj.id]: 0,
          },
          longestPath: 0,
          nextToVisit: destsForObjects[catId][firstObj.id],
        })),
        partitions: firstTier.objects.reduce(
          (accum, obj, i) => ({
            ...accum,
            [obj.id]: i,
          }),
          {},
        ),
      },
    ],
    [],
  );

  while (continueWalking(tentativeTierings)) {
    for (const { categoryId, tierings, partitions } of tentativeTierings) {
      const reAssignPartitionIds = (oldId: number, newId: number) => {
        for (const [objId, p] of Object.entries(partitions)) {
          if (p === oldId) {
            partitions[objId] = newId;
          }
        }
      };

      for (const tiering of tierings) {
        const filteredNext = tiering.nextToVisit.filter(
          (objId) => tiering.tiers[objId] === undefined,
        );
        if (filteredNext.length === 0) {
          tiering.nextToVisit = [];
          continue;
        }

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
        tiering.nextToVisit = filteredNext.reduce<string[]>(
          (nextIds, prevId) => {
            const dests = destsForObjects[categoryId][prevId] ?? [];
            const filteredDests = dests.filter(
              (objId) => tiering.tiers[objId] === undefined,
            );
            return nextIds.concat(filteredDests);
          },
          [],
        );
      }
    }
  }
  console.debug('tentativeTierings', tentativeTierings);

  // For each partition, choose the tiering based on the longest path,
  // and assign all objects tiers based on that

  let globalRowsNeeded = 1;

  const tierings = tentativeTierings.map<ActualTierings>(
    ({ categoryId, tierings: tentative, partitions }) => {
      /*
    Recursively assign object tiers as one less than the smallest tier of the objects destinations
    The function will always terminate because it tracks visited objects
    If there is a path *to* a tiered object, it will return finite n >= 0
      n can't be negative as long as the tiering is based on the longest path in the partition
    If there is a path *from* a tiered object, it should have already been tiered in the graph walk above
    If there is no path to a tiered object, they must be in separate partitions
    */
      const getAndAssignTier = (
        t: IntermediateTiering,
        objId: string,
        visited = new Set<string>(),
      ): number => {
        visited.add(objId);
        const assignedTier = t.tiers[objId];
        if (assignedTier !== undefined) return assignedTier;
        const dests = destsForObjects[categoryId][objId].filter(
          (d) => !visited.has(d),
        );
        const minDestTier = dests.reduce((min, dest) => {
          const destTier = getAndAssignTier(t, dest, visited);
          if (destTier < min) return destTier;
          return min;
        }, Infinity);
        return minDestTier - 1;
      };

      const selectedTierings = Object.values(partitions).reduce<{
        [partId: number]: IntermediateTiering;
      }>(
        (a, p) => ({
          ...a,
          [p]: tentative.reduce((a, b) =>
            b.partitionId === p &&
            (a.partitionId !== p || b.longestPath > a.longestPath)
              ? b
              : a,
          ),
        }),
        {},
      );

      for (const obj of firstTierObjects[categoryId].objects) {
        const t = selectedTierings[partitions[obj.id]];
        getAndAssignTier(t, obj.id);
      }

      const partedTierings: Tiering[] = Object.values(selectedTierings).reduce<
        Tiering[]
      >((a, tiering) => {
        let largestTier = Object.values(tiering.tiers)[0];
        let largestTierSize = 1;
        // let secondLargestTier: number | undefined;
        // let secondLargestTierSize = 0;
        const objectsByTier: { [tier: number]: string[] } = {};

        for (const [objId, tier] of Object.entries(tiering.tiers)) {
          if (!objectsByTier[tier]) {
            objectsByTier[tier] = [objId];
            continue;
          }
          objectsByTier[tier].push(objId);
          if (objectsByTier[tier].length > largestTierSize) {
            // secondLargestTier = largestTier;
            // secondLargestTierSize = largestTierSize;
            largestTier = tier;
            largestTierSize = objectsByTier[tier].length;
          }
        }
        // const rowsNeeded = secondLargestTierSize + 1;
        if (largestTierSize > globalRowsNeeded) {
          globalRowsNeeded = largestTierSize;
        }

        const t: Tiering = {
          ...tiering,
          largestTierSize,
          largestTier,
          // secondLargestTier,
          objectsByTier,
        };

        return [...a, t];
      }, []);

      return {
        categoryId: categoryId,
        catTierings: partedTierings,
      };
    },
  );

  // TODO: assign affinities

  // Idea: Each object one step from longest path gets a random point on the unit n-sphere
  // Each object two steps gets the average of affinities of one-steps
  // Then we need to regress to a line

  // Local tops always = 0
  const getLocalPlacements = ({
    largestTier,
    largestTierSize,
    longestPath,
    objectsByTier,
  }: Tiering): LocalPlacements => {
    const localPlacement: { objId: string; col: number; row: number }[] = [];

    console.debug('getting local placements', {
      largestTier,
      largestTierSize,
      longestPath,
      objectsByTier,
    });
    if (longestPath < globalRowsNeeded) {
      // VERTICAL DIAGRAM
      for (let tier = 0; tier <= longestPath; tier++) {
        const tierObjs = objectsByTier[tier];
        const diffFromLargest = largestTierSize - tierObjs.length;
        let tierOffset =
          diffFromLargest % 2 === 0
            ? diffFromLargest / 2
            : (diffFromLargest - 1) / 2;
        for (const objId of tierObjs) {
          localPlacement.push({
            objId,
            col: tierOffset,
            row: tier,
          });
          tierOffset += 1;
        }
      }
      return {
        left: 0,
        numCols: largestTier,
        numRows: longestPath,
        placements: localPlacement,
      };
    }
    // HORIZONTAL DIAGRAM
    let left = 0;
    let right = largestTier - 1;

    for (let tier = 0; tier <= longestPath; tier++) {
      const tierObjs = objectsByTier[tier];
      console.debug('tierObjs', tierObjs);
      const diffFromLargest = largestTierSize - tierObjs.length;

      const naiveOffset =
        diffFromLargest % 2 === 0
          ? diffFromLargest / 2
          : (diffFromLargest - 1) / 2;
      const tierOffset =
        tier < largestTier
          ? Math.max(naiveOffset, diffFromLargest - tier)
          : Math.min(naiveOffset, longestPath - tier);
      let placeCol = tier - largestTier + tierOffset;
      let placeRow = largestTierSize - tierOffset - 1;
      if (left > placeCol) {
        left = placeCol;
      }
      for (const objId of tierObjs) {
        localPlacement.push({
          objId,
          col: placeCol,
          row: placeRow,
        });
        placeCol += 1;
        placeRow -= 1;
      }
      if (right < placeCol - 1) {
        right = placeCol - 1;
      }
      console.debug({ right, placeCol, tier });
    }

    return {
      left: left,
      numCols: right - left + 1,
      numRows: largestTierSize,
      placements: localPlacement,
    };
  };

  const numRows = 2 * globalRowsNeeded - 1;
  let numCols = 0;
  /** col, row */
  const objectPlacements: { [objectId: string]: [number, number] } = {};
  /** left, top, right, bottom */
  const categoryPlacements: {
    [catId: string]: [number, number, number, number];
  } = {};

  for (const { categoryId, catTierings } of tierings) {
    console.debug('placing a category');
    const catLeft = numCols;
    let catTop = numRows;
    let catRight = 0;
    let catBottom = 0;

    for (const tiering of catTierings) {
      const local = getLocalPlacements(tiering);
      console.debug('placing a partition', local);
      // Place globally
      const globalPlaceRow = globalRowsNeeded - local.numRows;
      for (const { objId, col: localCol, row: localRow } of local.placements) {
        console.debug('placing an object');
        objectPlacements[objId] = [
          numCols + localCol - local.left,
          globalPlaceRow + 2 * localRow,
        ];
      }
      numCols += local.numCols;

      // Increment cat bounds
      catRight = numCols - 1;
      if (globalPlaceRow < catTop) {
        catTop = globalPlaceRow;
      }
      const t = globalRowsNeeded + local.numRows;
      if (t > catBottom) {
        catBottom = t;
      }
    }
    categoryPlacements[categoryId] = [catLeft, catTop, catRight, catBottom];
  }

  const arrowPlacements = morphisms.reduce<Placements['arrows']>(
    (accum, morphism) => {
      const [srcCol, srcRow] = objectPlacements[morphism.sourceId];
      const [destCol, destRow] = objectPlacements[morphism.destId];

      const dx = destCol - srcCol;
      const dy = destRow - srcRow;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.tan(dy / dx);

      return {
        ...accum,
        [morphism.id]: {
          dx,
          dy,
          length,
          angle,
        },
      };
    },
    {},
  );

  return {
    numCols,
    numRows,
    objects: objectPlacements,
    categories: categoryPlacements,
    arrows: arrowPlacements,
  };
};
