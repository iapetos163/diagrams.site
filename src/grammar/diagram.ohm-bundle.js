'use strict';const ohm=require('ohm-js').default;const result=ohm.makeRecipe(["grammar",{"source":"Diagram {\n  Diagram = (PlainExpr Delimiter )* PlainExpr -- plain\n    | (Given Delimiter)* Given (QuantifiedExpr Delimiter)* QuantifiedExpr -- quantified\n    \n  math = \"$\" (any *) \"$\"\n  plainName = alnum +\n  identifier = math | plainName\n\n  Type = (caseInsensitive<\"object\"> | caseInsensitive<\"objects\">\n    | caseInsensitive<\"morphism\"> | caseInsensitive<\"morphisms\"> \n    | caseInsensitive<\"arrow\"> | caseInsensitive<\"arrows\"> \n    | caseInsensitive<\"category\"> | caseInsensitive<\"categories\"> \n    | caseInsensitive<\"functor\"> | caseInsensitive<\"functors\">) &space\n\n  ElementScope = caseInsensitive<\"in\"> identifier | \":\" identifier\n  MapScope = \":\" identifier \"->\" identifier\n    | caseInsensitive<\"from\"> identifier caseInsensitive<\"to\"> identifier\n  Scope = MapScope | ElementScope\n\n  List<e> = ((e \",\") + caseInsensitive<\"and\"> ?) ? e -- list\n    | e caseInsensitive<\"and\"> e -- pair\n\n  TypedListScoped = Type ? List<identifier> Scope\n  TypedListUnscoped = Type ? List<identifier>\n  TypedList = TypedListScoped | TypedListUnscoped\n\n  PlainExpr = List<TypedList>\n\n  Given = caseInsensitive<\"given\"> List<TypedList>\n\n  exists = (caseInsensitive<\"is\"> | caseInsensitive<\"are\"> | caseInsensitive<\"exists\"> | caseInsensitive<\"exist\">) &space\n  SuchThat = ((caseInsensitive<\"such\"> | caseInsensitive<\"so\">) caseInsensitive<\"that\">) -- suchthat\n  | caseInsensitive<\"s.t.\">\n  | \":\"\n  article = (caseInsensitive<\"a\"> | caseInsensitive<\"an\">) &space\n  Exists = caseInsensitive<\"there\"> exists article ? caseInsensitive<\"unique\"> ? PlainExpr (SuchThat SubExpr) ? \n\n  ForallPrecedent = caseInsensitive<\"given\"> (article | caseInsensitive<\"any\">)? -- given\n    | caseInsensitive<\"for\"> ((article | caseInsensitive<\"any\"> | caseInsensitive<\"every\">) caseInsensitive<\"given\"> ?)? -- for1\n    | caseInsensitive<\"for\"> caseInsensitive<\"all\"> -- for2\n  Forall = ForallPrecedent PlainExpr (\",\" | \":\") ? SubExpr\n\n  QuantifiedExpr = Exists | Forall\n\n  Expr = PlainExpr | QuantifiedExpr\n  SubExpr = \"(\" Expr \")\" -- paren\n   | Expr -- noparen\n\n  Delimiter = \".\" | \";\" | \"\\n\"\n}"},"Diagram",null,"Diagram",{"Diagram_plain":["define",{"sourceInterval":[22,64]},null,[],["seq",{"sourceInterval":[22,55]},["star",{"sourceInterval":[22,45]},["seq",{"sourceInterval":[23,42]},["app",{"sourceInterval":[23,32]},"PlainExpr",[]],["app",{"sourceInterval":[33,42]},"Delimiter",[]]]],["app",{"sourceInterval":[46,55]},"PlainExpr",[]]]],"Diagram_quantified":["define",{"sourceInterval":[71,152]},null,[],["seq",{"sourceInterval":[71,138]},["star",{"sourceInterval":[71,89]},["seq",{"sourceInterval":[72,87]},["app",{"sourceInterval":[72,77]},"Given",[]],["app",{"sourceInterval":[78,87]},"Delimiter",[]]]],["app",{"sourceInterval":[90,95]},"Given",[]],["star",{"sourceInterval":[96,123]},["seq",{"sourceInterval":[97,121]},["app",{"sourceInterval":[97,111]},"QuantifiedExpr",[]],["app",{"sourceInterval":[112,121]},"Delimiter",[]]]],["app",{"sourceInterval":[124,138]},"QuantifiedExpr",[]]]],"Diagram":["define",{"sourceInterval":[12,152]},null,[],["alt",{"sourceInterval":[22,152]},["app",{"sourceInterval":[22,55]},"Diagram_plain",[]],["app",{"sourceInterval":[71,138]},"Diagram_quantified",[]]]],"math":["define",{"sourceInterval":[160,182]},null,[],["seq",{"sourceInterval":[167,182]},["terminal",{"sourceInterval":[167,170]},"$"],["star",{"sourceInterval":[172,177]},["app",{"sourceInterval":[172,175]},"any",[]]],["terminal",{"sourceInterval":[179,182]},"$"]]],"plainName":["define",{"sourceInterval":[185,204]},null,[],["plus",{"sourceInterval":[197,204]},["app",{"sourceInterval":[197,202]},"alnum",[]]]],"identifier":["define",{"sourceInterval":[207,236]},null,[],["alt",{"sourceInterval":[220,236]},["app",{"sourceInterval":[220,224]},"math",[]],["app",{"sourceInterval":[227,236]},"plainName",[]]]],"Type":["define",{"sourceInterval":[240,566]},null,[],["seq",{"sourceInterval":[247,566]},["alt",{"sourceInterval":[248,558]},["app",{"sourceInterval":[248,273]},"caseInsensitive",[["terminal",{"sourceInterval":[264,272]},"object"]]],["app",{"sourceInterval":[276,302]},"caseInsensitive",[["terminal",{"sourceInterval":[292,301]},"objects"]]],["app",{"sourceInterval":[309,336]},"caseInsensitive",[["terminal",{"sourceInterval":[325,335]},"morphism"]]],["app",{"sourceInterval":[339,367]},"caseInsensitive",[["terminal",{"sourceInterval":[355,366]},"morphisms"]]],["app",{"sourceInterval":[375,399]},"caseInsensitive",[["terminal",{"sourceInterval":[391,398]},"arrow"]]],["app",{"sourceInterval":[402,427]},"caseInsensitive",[["terminal",{"sourceInterval":[418,426]},"arrows"]]],["app",{"sourceInterval":[435,462]},"caseInsensitive",[["terminal",{"sourceInterval":[451,461]},"category"]]],["app",{"sourceInterval":[465,494]},"caseInsensitive",[["terminal",{"sourceInterval":[481,493]},"categories"]]],["app",{"sourceInterval":[502,528]},"caseInsensitive",[["terminal",{"sourceInterval":[518,527]},"functor"]]],["app",{"sourceInterval":[531,558]},"caseInsensitive",[["terminal",{"sourceInterval":[547,557]},"functors"]]]],["lookahead",{"sourceInterval":[560,566]},["app",{"sourceInterval":[561,566]},"space",[]]]]],"ElementScope":["define",{"sourceInterval":[570,634]},null,[],["alt",{"sourceInterval":[585,634]},["seq",{"sourceInterval":[585,617]},["app",{"sourceInterval":[585,606]},"caseInsensitive",[["terminal",{"sourceInterval":[601,605]},"in"]]],["app",{"sourceInterval":[607,617]},"identifier",[]]],["seq",{"sourceInterval":[620,634]},["terminal",{"sourceInterval":[620,623]},":"],["app",{"sourceInterval":[624,634]},"identifier",[]]]]],"MapScope":["define",{"sourceInterval":[637,752]},null,[],["alt",{"sourceInterval":[648,752]},["seq",{"sourceInterval":[648,678]},["terminal",{"sourceInterval":[648,651]},":"],["app",{"sourceInterval":[652,662]},"identifier",[]],["terminal",{"sourceInterval":[663,667]},"->"],["app",{"sourceInterval":[668,678]},"identifier",[]]],["seq",{"sourceInterval":[685,752]},["app",{"sourceInterval":[685,708]},"caseInsensitive",[["terminal",{"sourceInterval":[701,707]},"from"]]],["app",{"sourceInterval":[709,719]},"identifier",[]],["app",{"sourceInterval":[720,741]},"caseInsensitive",[["terminal",{"sourceInterval":[736,740]},"to"]]],["app",{"sourceInterval":[742,752]},"identifier",[]]]]],"Scope":["define",{"sourceInterval":[755,786]},null,[],["alt",{"sourceInterval":[763,786]},["app",{"sourceInterval":[763,771]},"MapScope",[]],["app",{"sourceInterval":[774,786]},"ElementScope",[]]]],"List_list":["define",{"sourceInterval":[800,848]},null,["e"],["seq",{"sourceInterval":[800,840]},["opt",{"sourceInterval":[800,838]},["seq",{"sourceInterval":[801,835]},["plus",{"sourceInterval":[801,810]},["seq",{"sourceInterval":[802,807]},["param",{"sourceInterval":[802,803]},0],["terminal",{"sourceInterval":[804,807]},","]]],["opt",{"sourceInterval":[811,835]},["app",{"sourceInterval":[811,833]},"caseInsensitive",[["terminal",{"sourceInterval":[827,832]},"and"]]]]]],["param",{"sourceInterval":[839,840]},0]]],"List_pair":["define",{"sourceInterval":[855,889]},null,["e"],["seq",{"sourceInterval":[855,881]},["param",{"sourceInterval":[855,856]},0],["app",{"sourceInterval":[857,879]},"caseInsensitive",[["terminal",{"sourceInterval":[873,878]},"and"]]],["param",{"sourceInterval":[880,881]},0]]],"List":["define",{"sourceInterval":[790,889]},null,["e"],["alt",{"sourceInterval":[800,889]},["app",{"sourceInterval":[800,840]},"List_list",[["param",{},0]]],["app",{"sourceInterval":[855,881]},"List_pair",[["param",{},0]]]]],"TypedListScoped":["define",{"sourceInterval":[893,940]},null,[],["seq",{"sourceInterval":[911,940]},["opt",{"sourceInterval":[911,917]},["app",{"sourceInterval":[911,915]},"Type",[]]],["app",{"sourceInterval":[918,934]},"List",[["app",{"sourceInterval":[923,933]},"identifier",[]]]],["app",{"sourceInterval":[935,940]},"Scope",[]]]],"TypedListUnscoped":["define",{"sourceInterval":[943,986]},null,[],["seq",{"sourceInterval":[963,986]},["opt",{"sourceInterval":[963,969]},["app",{"sourceInterval":[963,967]},"Type",[]]],["app",{"sourceInterval":[970,986]},"List",[["app",{"sourceInterval":[975,985]},"identifier",[]]]]]],"TypedList":["define",{"sourceInterval":[989,1036]},null,[],["alt",{"sourceInterval":[1001,1036]},["app",{"sourceInterval":[1001,1016]},"TypedListScoped",[]],["app",{"sourceInterval":[1019,1036]},"TypedListUnscoped",[]]]],"PlainExpr":["define",{"sourceInterval":[1040,1067]},null,[],["app",{"sourceInterval":[1052,1067]},"List",[["app",{"sourceInterval":[1057,1066]},"TypedList",[]]]]],"Given":["define",{"sourceInterval":[1071,1119]},null,[],["seq",{"sourceInterval":[1079,1119]},["app",{"sourceInterval":[1079,1103]},"caseInsensitive",[["terminal",{"sourceInterval":[1095,1102]},"given"]]],["app",{"sourceInterval":[1104,1119]},"List",[["app",{"sourceInterval":[1109,1118]},"TypedList",[]]]]]],"exists":["define",{"sourceInterval":[1123,1242]},null,[],["seq",{"sourceInterval":[1132,1242]},["alt",{"sourceInterval":[1133,1234]},["app",{"sourceInterval":[1133,1154]},"caseInsensitive",[["terminal",{"sourceInterval":[1149,1153]},"is"]]],["app",{"sourceInterval":[1157,1179]},"caseInsensitive",[["terminal",{"sourceInterval":[1173,1178]},"are"]]],["app",{"sourceInterval":[1182,1207]},"caseInsensitive",[["terminal",{"sourceInterval":[1198,1206]},"exists"]]],["app",{"sourceInterval":[1210,1234]},"caseInsensitive",[["terminal",{"sourceInterval":[1226,1233]},"exist"]]]],["lookahead",{"sourceInterval":[1236,1242]},["app",{"sourceInterval":[1237,1242]},"space",[]]]]],"SuchThat_suchthat":["define",{"sourceInterval":[1256,1343]},null,[],["seq",{"sourceInterval":[1256,1331]},["alt",{"sourceInterval":[1258,1305]},["app",{"sourceInterval":[1258,1281]},"caseInsensitive",[["terminal",{"sourceInterval":[1274,1280]},"such"]]],["app",{"sourceInterval":[1284,1305]},"caseInsensitive",[["terminal",{"sourceInterval":[1300,1304]},"so"]]]],["app",{"sourceInterval":[1307,1330]},"caseInsensitive",[["terminal",{"sourceInterval":[1323,1329]},"that"]]]]],"SuchThat":["define",{"sourceInterval":[1245,1379]},null,[],["alt",{"sourceInterval":[1256,1379]},["app",{"sourceInterval":[1256,1331]},"SuchThat_suchthat",[]],["app",{"sourceInterval":[1348,1371]},"caseInsensitive",[["terminal",{"sourceInterval":[1364,1370]},"s.t."]]],["terminal",{"sourceInterval":[1376,1379]},":"]]],"article":["define",{"sourceInterval":[1382,1445]},null,[],["seq",{"sourceInterval":[1392,1445]},["alt",{"sourceInterval":[1393,1437]},["app",{"sourceInterval":[1393,1413]},"caseInsensitive",[["terminal",{"sourceInterval":[1409,1412]},"a"]]],["app",{"sourceInterval":[1416,1437]},"caseInsensitive",[["terminal",{"sourceInterval":[1432,1436]},"an"]]]],["lookahead",{"sourceInterval":[1439,1445]},["app",{"sourceInterval":[1440,1445]},"space",[]]]]],"Exists":["define",{"sourceInterval":[1448,1557]},null,[],["seq",{"sourceInterval":[1457,1557]},["app",{"sourceInterval":[1457,1481]},"caseInsensitive",[["terminal",{"sourceInterval":[1473,1480]},"there"]]],["app",{"sourceInterval":[1482,1488]},"exists",[]],["opt",{"sourceInterval":[1489,1498]},["app",{"sourceInterval":[1489,1496]},"article",[]]],["opt",{"sourceInterval":[1499,1526]},["app",{"sourceInterval":[1499,1524]},"caseInsensitive",[["terminal",{"sourceInterval":[1515,1523]},"unique"]]]],["app",{"sourceInterval":[1527,1536]},"PlainExpr",[]],["opt",{"sourceInterval":[1537,1557]},["seq",{"sourceInterval":[1538,1554]},["app",{"sourceInterval":[1538,1546]},"SuchThat",[]],["app",{"sourceInterval":[1547,1554]},"SubExpr",[]]]]]],"ForallPrecedent_given":["define",{"sourceInterval":[1580,1649]},null,[],["seq",{"sourceInterval":[1580,1640]},["app",{"sourceInterval":[1580,1604]},"caseInsensitive",[["terminal",{"sourceInterval":[1596,1603]},"given"]]],["opt",{"sourceInterval":[1605,1640]},["alt",{"sourceInterval":[1606,1638]},["app",{"sourceInterval":[1606,1613]},"article",[]],["app",{"sourceInterval":[1616,1638]},"caseInsensitive",[["terminal",{"sourceInterval":[1632,1637]},"any"]]]]]]],"ForallPrecedent_for1":["define",{"sourceInterval":[1656,1778]},null,[],["seq",{"sourceInterval":[1656,1770]},["app",{"sourceInterval":[1656,1678]},"caseInsensitive",[["terminal",{"sourceInterval":[1672,1677]},"for"]]],["opt",{"sourceInterval":[1679,1770]},["seq",{"sourceInterval":[1680,1768]},["alt",{"sourceInterval":[1681,1740]},["app",{"sourceInterval":[1681,1688]},"article",[]],["app",{"sourceInterval":[1691,1713]},"caseInsensitive",[["terminal",{"sourceInterval":[1707,1712]},"any"]]],["app",{"sourceInterval":[1716,1740]},"caseInsensitive",[["terminal",{"sourceInterval":[1732,1739]},"every"]]]],["opt",{"sourceInterval":[1742,1768]},["app",{"sourceInterval":[1742,1766]},"caseInsensitive",[["terminal",{"sourceInterval":[1758,1765]},"given"]]]]]]]],"ForallPrecedent_for2":["define",{"sourceInterval":[1785,1838]},null,[],["seq",{"sourceInterval":[1785,1830]},["app",{"sourceInterval":[1785,1807]},"caseInsensitive",[["terminal",{"sourceInterval":[1801,1806]},"for"]]],["app",{"sourceInterval":[1808,1830]},"caseInsensitive",[["terminal",{"sourceInterval":[1824,1829]},"all"]]]]],"ForallPrecedent":["define",{"sourceInterval":[1562,1838]},null,[],["alt",{"sourceInterval":[1580,1838]},["app",{"sourceInterval":[1580,1640]},"ForallPrecedent_given",[]],["app",{"sourceInterval":[1656,1770]},"ForallPrecedent_for1",[]],["app",{"sourceInterval":[1785,1830]},"ForallPrecedent_for2",[]]]],"Forall":["define",{"sourceInterval":[1841,1897]},null,[],["seq",{"sourceInterval":[1850,1897]},["app",{"sourceInterval":[1850,1865]},"ForallPrecedent",[]],["app",{"sourceInterval":[1866,1875]},"PlainExpr",[]],["opt",{"sourceInterval":[1876,1889]},["alt",{"sourceInterval":[1877,1886]},["terminal",{"sourceInterval":[1877,1880]},","],["terminal",{"sourceInterval":[1883,1886]},":"]]],["app",{"sourceInterval":[1890,1897]},"SubExpr",[]]]],"QuantifiedExpr":["define",{"sourceInterval":[1901,1933]},null,[],["alt",{"sourceInterval":[1918,1933]},["app",{"sourceInterval":[1918,1924]},"Exists",[]],["app",{"sourceInterval":[1927,1933]},"Forall",[]]]],"Expr":["define",{"sourceInterval":[1937,1970]},null,[],["alt",{"sourceInterval":[1944,1970]},["app",{"sourceInterval":[1944,1953]},"PlainExpr",[]],["app",{"sourceInterval":[1956,1970]},"QuantifiedExpr",[]]]],"SubExpr_paren":["define",{"sourceInterval":[1983,2004]},null,[],["seq",{"sourceInterval":[1983,1995]},["terminal",{"sourceInterval":[1983,1986]},"("],["app",{"sourceInterval":[1987,1991]},"Expr",[]],["terminal",{"sourceInterval":[1992,1995]},")"]]],"SubExpr_noparen":["define",{"sourceInterval":[2010,2025]},null,[],["app",{"sourceInterval":[2010,2014]},"Expr",[]]],"SubExpr":["define",{"sourceInterval":[1973,2025]},null,[],["alt",{"sourceInterval":[1983,2025]},["app",{"sourceInterval":[1983,1995]},"SubExpr_paren",[]],["app",{"sourceInterval":[2010,2014]},"SubExpr_noparen",[]]]],"Delimiter":["define",{"sourceInterval":[2029,2057]},null,[],["alt",{"sourceInterval":[2041,2057]},["terminal",{"sourceInterval":[2041,2044]},"."],["terminal",{"sourceInterval":[2047,2050]},";"],["terminal",{"sourceInterval":[2053,2057]},"\n"]]]}]);module.exports=result;