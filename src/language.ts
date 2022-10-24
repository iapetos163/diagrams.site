import {
  DiagramModel,
  emptyDiagram,
  Obj,
  Quantification,
  validateDiagram,
} from './diagram-model';
import grammar from './grammar/diagram.ohm-bundle';

type ExprType = 'object' | 'morphism' | 'category' | 'functor';

type Scope =
  | {
      type: 'element';
      subjectName: string;
    }
  | {
      type: 'map';
      subjectName: string;
      cosubjectName: string;
    };

type StatementContext = {
  quantification: Quantification;
  diagram: DiagramModel;
  /** name: id */
  names: Record<string, string>;
};

const emptyContext: StatementContext = {
  diagram: emptyDiagram,
  quantification: 'GIVEN',
  names: {},
};

type IdListContext = StatementContext & {
  exprType?: ExprType;
  scope?: Scope;
};

const makeId = (name: string, taken: string[]) => {
  const normalized = name.toLowerCase().replaceAll(/[^\w-]/, '');
  if (normalized && !taken.some((t) => t === normalized)) return normalized;
  let i = normalized ? 2 : 1;
  while (taken.some((t) => t === `${normalized}__${i}`)) {
    i += 1;
  }
  return `${normalized}__${i}`;
};

const addIdentifiers = (
  names: string[],
  { names: nameIds, exprType, scope, diagram, quantification }: IdListContext,
): StatementContext => {
  if (!exprType) {
    if (!scope || scope.type === 'element') {
      exprType = 'object';
    } else {
      const sourceId = nameIds[scope.subjectName];
      const sourceCat = diagram.categories.find((c) => c.id === sourceId);
      exprType = sourceCat ? 'functor' : 'morphism';
    }
  }

  for (const name of names) {
    if (nameIds[name]) {
      throw new Error(`Name ${name} declared more than once`);
    }
    const id = makeId(name, Object.values(nameIds));

    nameIds[name] = id;
    switch (exprType) {
      case 'category':
        diagram.categories.push({
          id,
          name,
        });
        break;
      case 'object': {
        const obj: Obj = {
          id,
          name,
          quantification: quantification,
        };
        if (scope) {
          if (!nameIds[scope.subjectName]) {
            throw new Error(
              `Category ${scope.subjectName} used before declaration`,
            );
          }
          obj.categoryId = nameIds[scope.subjectName];
        }
        diagram.objects.push(obj);
        break;
      }
      case 'morphism': {
        if (!scope) {
          throw new Error(`Morphism ${name} is missing a domain and codomain`);
        }
        if (scope.type !== 'map') {
          throw new Error(`Morphism ${name} is missing a codomain`);
        }
        const sourceId = nameIds[scope.subjectName];
        if (!sourceId) {
          throw new Error(
            `Object ${scope.subjectName} used before declaration`,
          );
        }
        const destId = nameIds[scope.cosubjectName];
        if (!destId) {
          throw new Error(
            `Object ${scope.cosubjectName} used before declaration`,
          );
        }
        diagram.morphisms.push({
          id,
          name,
          sourceId,
          destId,
          quantification,
          categoryId: diagram.objects.find((o) => o.id === sourceId)
            ?.categoryId,
        });
        break;
      }
      case 'functor': {
        if (!scope) {
          throw new Error(`Functor ${name} is missing a domain and codomain`);
        }
        if (scope.type !== 'map') {
          throw new Error(`Functor ${name} is missing a codomain`);
        }
        const sourceId = nameIds[scope.subjectName];
        if (!sourceId) {
          throw new Error(
            `Category ${scope.subjectName} used before declaration`,
          );
        }
        const destId = nameIds[scope.cosubjectName];
        if (!destId) {
          throw new Error(
            `Category ${scope.cosubjectName} used before declaration`,
          );
        }
        diagram.functors.push({
          id,
          name,
          sourceCategoryId: sourceId,
          destCategoryId: destId,
        });
        break;
      }
      default:
        throw new Error(`Internal error: unrecognized exprType ${exprType}`);
    }
  }

  return {
    diagram,
    names: nameIds,
    quantification,
  };
};

export const getMatcher = () => grammar.matcher();

export const semantics = grammar.createSemantics();

semantics.addAttribute('name', {
  Math($1, node, $2) {
    const norm = node.sourceString.trim().replaceAll(/\s+/, ' ');
    return `$${norm}$`;
  },
  plainName(node) {
    return node.sourceString.toLowerCase();
  },
  Identifier(node) {
    return node.name;
  },
});

semantics.addAttribute('exprType', {
  Type(node): ExprType {
    const s = node.sourceString.trim().toLowerCase();
    switch (s) {
      case 'object':
      case 'objects':
        return 'object';
      case 'morphism':
      case 'morphisms':
      case 'arrow':
      case 'arrows':
        return 'morphism';
      case 'category':
      case 'categories':
        return 'category';
      case 'functor':
      case 'functors':
        return 'functor';
      default:
        throw new Error(`Internal error: unexpected type ${s}`);
    }
  },
});

semantics.addAttribute('scope', {
  ElementScope(in_, subjectNode): Scope {
    return {
      type: 'element',
      subjectName: subjectNode.name,
    };
  },
  MapScope(from_, source, to, dest): Scope {
    return {
      type: 'map',
      subjectName: source.name,
      cosubjectName: dest.name,
    };
  },
  Scope(node) {
    return node.scope;
  },
});

semantics.addAttribute('parseIdList', {
  List_list(ids, delim, and, id) {
    return (context: IdListContext): StatementContext => {
      const names = ids.children.concat([id]).map((idNode) => idNode.name);
      return addIdentifiers(names, context);
    };
  },
  List_pair(id1, and, id2) {
    return (context: IdListContext): StatementContext =>
      addIdentifiers([id1.name, id2.name], context);
  },
});

semantics.addAttribute('parseStatement', {
  TypedListScoped(typeNode, idList, scopeNode) {
    const exprType: ExprType | undefined =
      typeNode.numChildren > 0 ? typeNode.child(0).exprType : undefined;
    const scope: Scope = scopeNode.scope;
    return (sCtx: StatementContext): StatementContext => {
      const idCtx: IdListContext = {
        ...sCtx,
        scope,
        exprType,
      };
      return idList.parseIdList(idCtx);
    };
  },
  TypedListUnscoped(typeNode, idList) {
    const exprType: ExprType | undefined =
      typeNode.numChildren > 0 ? typeNode.child(0).exprType : undefined;
    return (sCtx: StatementContext): StatementContext => {
      const idCtx: IdListContext = {
        ...sCtx,
        exprType,
      };
      return idList.parseIdList(idCtx);
    };
  },
  TypedList(typedList) {
    return typedList.parseStatement;
  },
  PlainExpr(list) {
    return list.parseTypedListList;
  },
  Given(given, list) {
    return list.parseTypedListList;
  },
  Exists(there, exists, article, unique, typedList, st, subExpr) {
    const quantification: Quantification =
      unique.numChildren > 0 ? 'UNIQUE' : 'EXISTS';
    return ({ diagram }: StatementContext): StatementContext => {
      const context = typedList.parseStatement({
        diagram,
        quantification,
      });

      if (subExpr.numChildren > 0) {
        return subExpr.child(0).parseStatement(context);
      }
      return context;
    };
  },
  Forall(precedent, typedList, sep, subExpr) {
    return ({ diagram }: StatementContext): StatementContext =>
      subExpr.parseStatement(
        typedList.parseStatement({
          diagram,
          quantification: 'FORALL',
        }),
      );
  },
  QuantifiedExpr(expr) {
    return expr.parseStatement;
  },
  Expr(expr) {
    return expr.parseStatement;
  },
  SubExpr_noparen(expr) {
    return expr.parseStatement;
  },
  SubExpr_paren(lp, expr, rp) {
    return expr.parseStatement;
  },
});

semantics.addAttribute('parseTypedListList', {
  List_list(typedLists, delim, and, typedList) {
    return (context: StatementContext): StatementContext =>
      typedLists.children
        .concat([typedList])
        .reduce((c, node) => node.parseStatement(c), context);
  },
  List_pair(typedList1, and, typedList2) {
    return (context: StatementContext): StatementContext =>
      typedList2.parseStatement(typedList1.parseStatement(context));
  },
});

semantics.addAttribute('eval', {
  Diagram_plain(exprs, delim, expr) {
    const context = exprs.children.concat([expr]).reduce((context, node) => {
      return node.parseStatement(context);
    }, emptyContext);

    validateDiagram(context.diagram);
    return context.diagram;
  },
  Diagram_quantified(givens, delim1, given, quantifieds, delim2, quantified) {
    const context = givens.children
      .concat([given], quantifieds.children, [quantified])
      .reduce((context, node) => node.parseStatement(context), emptyContext);

    validateDiagram(context.diagram);
    return context.diagram;
  },
});
