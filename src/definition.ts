export const grammarSource = String.raw`
Diagram {
  Math = "$" (any *) "$"
  plainName = alnum +
  Identifier = Math | plainName

  ElementScope = caseInsensitive<"in"> Identifier | ":" Identifier
  MapScope = ":" Identifer "->" Identifier
    | caseInsensitive<"from"> Identifier caseInsensitive<"to"> Identifier"
  Scope = MapScope | ElementScope

  List<e> ((e ",") + "caseInsensitive<"and"> ?) ? e
    | e caseInsensitive<"and"> e

  TypedListScoped = Type ? List<Identifier> Scope
  TypedListUnscoped = Type ? List<Identifier>
  TypedList = TypedListScoped | TypedListUnscoped

  PlainExpr = List<TypedList>

  Given = caseInsensitive<"given"> List<TypedList>

  exists = caseInsensitive<"is"> | caseInsensitive<"are"> | caseInsensitive<"exists"> | caseInsensitive<"exist">
  SuchThat = ((caseInsensitive<"such"> | caseInsensitive<"so">) caseInsensitive<"that">) | caseInsensitive<"s.t.'> | ":"
  article = caseInsensitive<"a"> | caseInsensitive<"an">
  Exists = caseInsensitive<"there"> exists article ? caseInsensitive<"unique"> TypedList (SuchThat SubExpr) ? 

  ForallPrecedent = caseInsensitive<"given"> (article | caseInsensitive<"any">)?
    | caseInsensitive<"for"> ((article | caseInsensitive<"any"> | caseInsensitive<"every">) caseInsensitive<"given"> ?)?
    | caseInsensitive<"for"> caseInsensitive<"all">
  Forall = ForallPrecedent TypedList ("," | ":") ? SubExpr

  QuantifiedExpr = Exists | Forall

  Expr = PlainExpr | QuantifiedExpr
  SubExpr = "(" Expr ")"
   | Expr

  Delimiter = "." | ";" | "\n"
  Diagram = (PlainExpr Delimiter )* PlainExpr
    | (Given Delimiter)* Given (QuantifiedExpr Delimiter)* QuantifiedExpr
}
`;
