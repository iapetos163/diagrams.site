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
  id: string;
  type: 'object' | 'morphism';
  /** Required if in a diagram with functors.length > 0 */
  functorId?: string;
  sourceId: string;
  destId: string;
}

export interface DiagramModel {
  id: string;
  categories: Category[];
  objects: Obj[];
  morphisms: Morphism[];
  functors: Functor[];
  functorMappings: FunctorMapping[];
}

export const emptyDiagram: DiagramModel = {
  id: 'diagram',
  objects: [],
  categories: [],
  morphisms: [],
  functorMappings: [],
  functors: [],
};

export class InvalidDiagramError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// TODO: validate specifying cat & functor ids
export const validateDiagram = (diagram: DiagramModel) => {
  if ((new Set(diagram.categories.map(c => c.id))).size !== diagram.categories.length) {
    throw new InvalidDiagramError('Duplicate category IDs');
  }

  if ((new Set(diagram.objects.map(o => o.id))).size !== diagram.objects.length) {
    throw new InvalidDiagramError('Duplicate object IDs');
  }

  for (const obj of diagram.objects) {
    if (obj.categoryId && !diagram.categories.some(c => c.id === obj.categoryId)) {
      throw new InvalidDiagramError(`Category ${obj.categoryId} for object ${obj.id} not found`);
    }
  }

  if ((new Set(diagram.morphisms.map(o => o.id))).size !== diagram.morphisms.length) {
    throw new InvalidDiagramError('Duplicate morphism IDs');
  }

  for (const morphism of diagram.morphisms) {
    if (morphism.categoryId && !diagram.categories.some(c => c.id === morphism.categoryId)) {
      throw new InvalidDiagramError(`Category ${morphism.categoryId} for morphism ${morphism.id} not found`);
    }

    const sourceObj = diagram.objects.find(o => o.id === morphism.sourceId)
    if (!sourceObj) {
      throw new InvalidDiagramError(`Source object ${morphism.sourceId} for morphism ${morphism.id} not found`);
    }
    if (sourceObj.categoryId !== morphism.categoryId) {
      throw new InvalidDiagramError(`Category ID mismatch between object ${sourceObj.id} and morphism ${morphism.id}`);
    }

    const destObj = diagram.objects.find(o => o.id === morphism.destId)
    if (!destObj) {
      throw new InvalidDiagramError(`Destination object ${morphism.destId} for morphism ${morphism.id} not found`);
    }
    if (destObj.categoryId !== morphism.categoryId) {
      throw new InvalidDiagramError(`Category ID mismatch between object ${destObj.id} and morphism ${morphism.id}`);
    }
  }

  if ((new Set(diagram.functors.map(o => o.id))).size !== diagram.functors.length) {
    throw new InvalidDiagramError('Duplicate functor IDs');
  }

  for (const functor of diagram.functors) {
    if (!diagram.objects.some(o => o.id === functor.sourceCategoryId)) {
      throw new InvalidDiagramError(`Source category ${functor.sourceCategoryId} for functor ${functor.id} not found`);
    }

    if (!diagram.objects.some(o => o.id === functor.destCategoryId)) {
      throw new InvalidDiagramError(`Destination category ${functor.destCategoryId} for functor ${functor.id} not found`);
    }
  }

  if ((new Set(diagram.functorMappings.map(o => o.id))).size !== diagram.functorMappings.length) {
    throw new InvalidDiagramError('Duplicate functor mapping IDs');
  }

  for (const functorMapping of diagram.functorMappings) {
    const functor = diagram.functors.find(f => f.id === functorMapping.functorId);
    if (functorMapping.functorId && !functor) {
      throw new InvalidDiagramError(`Functor ${functorMapping.functorId} for functor mapping ${functorMapping.id} not found`);
    }

    if (functorMapping.type === 'object') {
      const sourceObj = diagram.objects.find(o => o.id === functorMapping.sourceId)
      if (!sourceObj) {
        throw new InvalidDiagramError(`Source object ${functorMapping.sourceId} for functorMapping ${functorMapping.id} not found`);
      }
      if (functor && sourceObj.categoryId !== functor.sourceCategoryId) {
        throw new InvalidDiagramError(`Category ID mismatch between object ${sourceObj.id} and functor mapping ${functorMapping.id}`);
      }

      const destObj = diagram.objects.find(o => o.id === functorMapping.destId)
      if (!destObj) {
        throw new InvalidDiagramError(`Destination object ${functorMapping.destId} for functor mapping ${functorMapping.id} not found`);
      }
      if (functor && destObj.categoryId !== functor.destCategoryId) {
        throw new InvalidDiagramError(`Category ID mismatch between object ${destObj.id} and functor mapping ${functorMapping.id}`);
      }
    } else {
      const sourceMorphism = diagram.morphisms.find(o => o.id === functorMapping.sourceId)
      if (!sourceMorphism) {
        throw new InvalidDiagramError(`Source morphism ${functorMapping.sourceId} for functorMapping ${functorMapping.id} not found`);
      }
      if (functor && sourceMorphism.categoryId !== functor.sourceCategoryId) {
        throw new InvalidDiagramError(`Category ID mismatch between morphism ${sourceMorphism.id} and functor mapping ${functorMapping.id}`);
      }

      const destMorphism = diagram.morphisms.find(o => o.id === functorMapping.destId)
      if (!destMorphism) {
        throw new InvalidDiagramError(`Destination morphism ${functorMapping.destId} for functorMapping ${functorMapping.id} not found`);
      }
      if (functor && destMorphism.categoryId !== functor.destCategoryId) {
        throw new InvalidDiagramError(`Category ID mismatch between morphism ${destMorphism.id} and functorMapping ${functorMapping.id}`);
      }
    }
  }
}