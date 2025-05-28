export interface ASTNode {
    type: string;
}

export interface Stmt extends ASTNode {
    type: "Statement";
    statement: FunctionCall | FunctionDefinition;
}

// I'm not sure if I'm going to keep this
// Whats the difference between Statements and a Scope?
export interface Stmts extends ASTNode {
    type: "Statements";
    statements: (Stmt | Scope)[];
}

export interface Scope extends ASTNode {
    type: "Scope";
    statements: (Stmt | Scope)[]
}

export interface NumberLiteral extends ASTNode {
    type: "NumberLiteral";
    value: number;
}

export interface CharLiteral extends ASTNode {
    type: "CharLiteral";
    value: string;
}

export interface StringLiteral extends ASTNode {
    type: "StringLiteral";
    value: string;
}

export interface TemplateStringLiteral extends ASTNode {
    type: "TemplateStringLiteral";
    value: string;
}

export interface ArrayLiteral extends ASTNode {
    type: "ArrayLiteral";
    elements: (NumberLiteral | CharLiteral | StringLiteral | TemplateStringLiteral | Identifier)[];
}

export interface Identifier extends ASTNode {
    type: "Identifier";
    name: string;
}

// Remember this is a custom operator and must have the operator definition and precedence
export interface BinaryExpression extends ASTNode {
    type: "BinaryExpression";
    left: ASTNode;
    operator: string;
    right: ASTNode;
}

// Is this needed? Because the assignment is made by a function call
export interface AssignmentExpression extends ASTNode {
    type: "AssignmentExpression";
    left: ASTNode;
    operator: string;
    right: ASTNode;
}

// how to best represent an expression node?
// Some references:
// - https://llvm.org/docs/tutorial/MyFirstLanguageFrontend/LangImpl02.html#the-abstract-syntax-tree-ast
// - https://clang.llvm.org/docs/IntroductionToTheClangAST.html
// - https://clang.llvm.org/extra/doxygen/structclang_1_1clangd_1_1ASTNode.html
export interface Expr extends ASTNode {
    type: "Expression";
    value: Expression;
}

export interface ScopeExpression extends ASTNode {
    type: "ScopeExpression";
    expressions: ASTNode[];
}

// What is a bracket expression? Is it an array literal?
export interface BracketExpression extends ASTNode {
    type: "BracketExpression";
    expressions: ASTNode[];
}

export interface ParamDefinition extends ASTNode {
    type: "ParamDefinition";
    name: Identifier;
    varType: Identifier;
}

export interface ParamsDefinition extends ASTNode {
    type: "ParamsDefinition";
    parameters: ParamDefinition[];
}

export interface FunctionParams extends ASTNode {
    type: "FunctionParams";
    parameters: ParamsDefinition;
}

export interface Param extends ASTNode {
    type: "Param";
    content: Identifier | NumberLiteral | CharLiteral | StringLiteral;
}

export interface Params extends ASTNode {
    type: "Params";
    params: Param[];
}

export interface FunctionCall extends ASTNode {
    type: "FunctionCall";
    identifier: Identifier;
    params: Params;
}

export interface FunctionDefinition extends ASTNode {
    type: "FunctionDefinition";
    params: FunctionParams;
    body: Stmt | Scope;
}

export interface TypeAnnotation extends ASTNode {
    type: "TypeAnnotation";
    left: ASTNode;
    operator: string;
    right: ASTNode;
}

export interface EOF extends ASTNode {
    type: "EOF";
}

export type Expression = FunctionCall | FunctionDefinition | NumberLiteral | Identifier | BinaryExpression | AssignmentExpression | ScopeExpression | BracketExpression;
