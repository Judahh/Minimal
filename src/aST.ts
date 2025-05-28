// Base AST Node
export interface ASTNode {
    type: string;
}

// ----------------------
// Literal Types
// ----------------------

export interface NumberLiteral extends ASTNode {
    type: "NumberLiteral";
    value: number;
}

export interface StringLiteral extends ASTNode {
    type: "StringLiteral";
    value: string;
}

export interface CharLiteral extends ASTNode {
    type: "CharLiteral";
    value: string;
}

export interface TemplateStringLiteral extends ASTNode {
    type: "TemplateStringLiteral";
    value: string;
}

// ----------------------
// Identifier
// ----------------------

export interface Identifier extends ASTNode {
    type: "Identifier";
    name: string;
}

// ----------------------
// Scope
// ----------------------

export interface Scope extends ASTNode {
    type: "Scope";
    statements: ASTNode[];
}

export interface ScopeExpression extends ASTNode {
    type: "ScopeExpression";
    scope: Scope;
}

// ----------------------
// Function Call
// ----------------------

export interface FunctionCall extends ASTNode {
    type: "FunctionCall";
    identifier: Identifier;
    params: Param[];
}

export interface Param extends ASTNode {
    type: "Param";
    content: Expression | Scope;
}

// ----------------------
// Function Definition
// ----------------------

export interface FunctionDefinition extends ASTNode {
    type: "FunctionDefinition";
    identifier: Identifier;
    params: ParamDefinition[];
    body: Scope;
}

export interface ParamDefinition extends ASTNode {
    type: "ParamDefinition";
    identifier: Identifier;
    annotation?: string;  // optional type annotation
}

// ----------------------
// Expressions
// ----------------------

export type Expression =
    | Identifier
    | NumberLiteral
    | StringLiteral
    | CharLiteral
    | TemplateStringLiteral
    | FunctionCall
    | ScopeExpression
    | BinaryExpression
    | AssignmentExpression
    | ArrayLiteral;

// ----------------------
// Binary Expression
// ----------------------

export interface BinaryExpression extends ASTNode {
    type: "BinaryExpression";
    left: Expression;
    operator: string;
    right: Expression;
}

// ----------------------
// Assignment Expression
// ----------------------

export interface AssignmentExpression extends ASTNode {
    type: "AssignmentExpression";
    identifier: Identifier;
    value: Expression;
}

// ----------------------
// Array Literal
// ----------------------

export interface ArrayLiteral extends ASTNode {
    type: "ArrayLiteral";
    elements: Expression[];
}

// ----------------------
// EOF
// ----------------------

export interface EOF extends ASTNode {
    type: "EOF";
}
