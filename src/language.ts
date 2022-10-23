import { DiagramModel } from './diagram-model';
import grammar from './grammar/diagram.ohm-bundle';

export const getMatcher = () => grammar.matcher();

export const semantics = grammar.createSemantics();




semantics.addAttribute('eval', {
  Diagram_plain(exprs, delim, expr) {
    exprs.children.concat([expr]).reduce((context, node) => {
      return node.parse(context);
    }, emptyDiagram);
  },
  Diagram_quantified(arg0, arg1, arg2, arg3, arg4, arg5) {

  },
});

semantics.addAttribute('parse', {
  PlainExpr(arg0) {
    return (context: DiagramModel): DiagramModel => {

    };
  },
})