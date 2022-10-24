// AUTOGENERATED FILE
// This file was generated from diagram.ohm by `ohm generateBundles`.

import {
  ActionDict,
  Grammar,
  IterationNode,
  Node,
  NonterminalNode,
  Semantics,
  TerminalNode
} from 'ohm-js';

export interface DiagramActionDict<T> extends ActionDict<T> {
  Math?: (this: NonterminalNode, arg0: TerminalNode, arg1: IterationNode, arg2: TerminalNode) => T;
  plainName?: (this: NonterminalNode, arg0: IterationNode) => T;
  Identifier?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  Type?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  ElementScope?: (this: NonterminalNode, arg0: NonterminalNode | TerminalNode, arg1: NonterminalNode) => T;
  MapScope?: (this: NonterminalNode, arg0: NonterminalNode | TerminalNode, arg1: NonterminalNode, arg2: NonterminalNode | TerminalNode, arg3: NonterminalNode) => T;
  Scope?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  List_list?: (this: NonterminalNode, arg0: IterationNode, arg1: IterationNode, arg2: IterationNode, arg3: Node) => T;
  List_pair?: (this: NonterminalNode, arg0: Node, arg1: NonterminalNode, arg2: Node) => T;
  List?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  TypedListScoped?: (this: NonterminalNode, arg0: IterationNode, arg1: NonterminalNode, arg2: NonterminalNode) => T;
  TypedListUnscoped?: (this: NonterminalNode, arg0: IterationNode, arg1: NonterminalNode) => T;
  TypedList?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  PlainExpr?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  Given?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode) => T;
  exists?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  SuchThat_suchthat?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode) => T;
  SuchThat?: (this: NonterminalNode, arg0: NonterminalNode | TerminalNode) => T;
  article?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  Exists?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: IterationNode, arg3: IterationNode, arg4: NonterminalNode, arg5: IterationNode, arg6: IterationNode) => T;
  ForallPrecedent_given?: (this: NonterminalNode, arg0: NonterminalNode, arg1: IterationNode) => T;
  ForallPrecedent_for1?: (this: NonterminalNode, arg0: NonterminalNode, arg1: IterationNode, arg2: IterationNode) => T;
  ForallPrecedent_for2?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode) => T;
  ForallPrecedent?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  Forall?: (this: NonterminalNode, arg0: NonterminalNode, arg1: NonterminalNode, arg2: IterationNode, arg3: NonterminalNode) => T;
  QuantifiedExpr?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  Expr?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  SubExpr_paren?: (this: NonterminalNode, arg0: TerminalNode, arg1: NonterminalNode, arg2: TerminalNode) => T;
  SubExpr_noparen?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  SubExpr?: (this: NonterminalNode, arg0: NonterminalNode) => T;
  Delimiter?: (this: NonterminalNode, arg0: TerminalNode) => T;
  Diagram_plain?: (this: NonterminalNode, arg0: IterationNode, arg1: IterationNode, arg2: NonterminalNode) => T;
  Diagram_quantified?: (this: NonterminalNode, arg0: IterationNode, arg1: IterationNode, arg2: NonterminalNode, arg3: IterationNode, arg4: IterationNode, arg5: NonterminalNode) => T;
  Diagram?: (this: NonterminalNode, arg0: NonterminalNode) => T;
}

export interface DiagramSemantics extends Semantics {
  addOperation<T>(name: string, actionDict: DiagramActionDict<T>): this;
  extendOperation<T>(name: string, actionDict: DiagramActionDict<T>): this;
  addAttribute<T>(name: string, actionDict: DiagramActionDict<T>): this;
  extendAttribute<T>(name: string, actionDict: DiagramActionDict<T>): this;
}

export interface DiagramGrammar extends Grammar {
  createSemantics(): DiagramSemantics;
  extendSemantics(superSemantics: DiagramSemantics): DiagramSemantics;
}

declare const grammar: DiagramGrammar;
export default grammar;

