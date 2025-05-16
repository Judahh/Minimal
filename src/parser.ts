import { TokenError } from "./errors";
import { TokenType, Token } from "./lexer";

export interface ASTNode {
    type: string;
}

export interface Stmt extends ASTNode{
    type: "Statement";
    statement: FunctionCall | FunctionDefinition;
}

// I'm not sure if I'm going to keep this
// Whats the difference between Statements and a Scope?
export interface Stmts extends ASTNode{
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

// Probably not needed, because there is no default operator
// the closest is the TypeAnnotation
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

export interface Expr extends ASTNode {  // how to best represent an expression node?
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

export class Parser {
    private tokens: Token[];
    private current = 0;
    private parentesisCount = 0;
    private braceCount = 0;
    private bracketCount = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private peek(): Token | null {
        return this.tokens[this.current] || null;
    }

    private consume(): Token {
        return this.tokens[this.current++];
    }

    private match(type: TokenType): boolean {
        if (this.peek()?.type === type) {
            this.consume();
            return true;
        }
        return false;
    }

    parse(): ASTNode[] {
        const ast: ASTNode[] = [];
        while (!this.isAtEnd()) {
            ast.push(this.parseStatement());
        }
        return ast;
    }
// error messages are still very much subject to change
// also, some flattening of some of the node structures would probably go a long way

    private parseStatement(): Stmt {
        let statement;
        if (this.check(TokenType.Identifier)){  // provisional, needs better handling
            statement = this.parseFunctionCall();
        }
        else{
            statement = this.parseFunctionDefinition(); // at the present moment, statements may only be function calls or function definitions
        }
        if (!this.check(TokenType.SemiColon)){
            throw new Error("Expected ';' after statement");
        }
        this.advance();
        return {type: "Statement", statement: statement} as Stmt
    }

    // I've defined scope to be a block scope and nothing else. A global scope is not a scope. Neither is the body of a function if the user does not employ braces,
    // in which case it's being treated as an expression. This is consistent with the JS design and behavior.
    private parseScope(): Scope {
        let statements: (Stmt | Scope)[] = []
        if (!this.match(TokenType.OpenBrace)){
            throw new Error("missing opening brace");
        }
        do{
            if (this.check(TokenType.OpenBrace)){
                statements.push(this.parseScope());
            }
            this.parseStatement();        
        } while(!this.isAtEnd && !this.check(TokenType.CloseBrace))
        if (this.isAtEnd()) {
            throw new Error("Unexpected EOF");
        }
        this.advance();
        return {type: "Scope", statements: statements} as Scope;
    }

    private parseFunctionDefinition(): FunctionDefinition {
        let params = this.parseFunctionParams();
        let body: (Expr | Scope)
        if (!this.check(TokenType.Arrow)){
            throw new Error(`unexpected token: ${this.peek()}`);
        }
        this.advance();
        if (this.check(TokenType.OpenBrace))
            body = this.parseScope();
        else{
            body = this.parseExpression();
        }
        return {type: "FunctionDefinition", params: params, body: body} as FunctionDefinition
    }

    private parseFunctionCall(): FunctionCall {
        const identifier = this.consume();
        if (identifier.type !== TokenType.Identifier) {
            throw new TokenError("wroong", identifier);
        }
        if (!this.match(TokenType.OpenParenthesis)) {
            throw new TokenError("wroong", identifier);
        }
        const params = this.parseParams();
        if (!this.check(TokenType.CloseParenthesis)) {
            throw new Error(`unexpected token: '${this.peek()?.value}'`);
        }
        this.advance();

        return {identifier: {type: "Identifier", name: identifier.value}, params: params} as FunctionCall
    }


    private parseParamsDefinition(): ParamsDefinition {
        const params: ParamDefinition[] = []
        do {
            params.push(this.parseParamDefinition());
            if (!this.check(TokenType.Comma) && !this.check(TokenType.CloseParenthesis)){
                throw new Error("expected ',' after param definition");
            }
        } while(this.check(TokenType.Comma) && this.advance());
        return {parameters: params} as ParamsDefinition

    }

    private parseParamDefinition(): ParamDefinition {
        if (!this.check(TokenType.Identifier)){
            throw new Error("expected parameter");
        }
        const name = this.consume();
        if (!this.match(TokenType.Colon)){
            throw new Error("expected type declaration after parameter");
        }
        const type = this.consume();
        if (type.type != TokenType.Identifier) {
            throw new TokenError("wrooong: ", [name, type]);
        }

        return {type: "ParamDefinition", name: {type: "Identifier", name: name.value}, varType: {type: "Identifier", name: type.value}} as ParamDefinition
    }

    private parseFunctionParams(): FunctionParams {
        let params;
        let unclosedParenthesis = this.check(TokenType.OpenParenthesis);
        if (unclosedParenthesis) {
            this.advance();
        }
        params = this.parseParamsDefinition();
        if (unclosedParenthesis && !this.match(TokenType.CloseParenthesis)){
            throw new Error("unclosed parenthesis")
        }
        return {type: "FunctionParams", parameters: params} as FunctionParams
    }

    private isLiteral(type: TokenType): boolean {
        return type === TokenType.Number || type === TokenType.String || type === TokenType.Char || type === TokenType.TemplateString;
    }

    private parseParam(): Param {
        const token = this.consume();        
        if(token.type == TokenType.Identifier) {
            return {type: "Param", content: {type: "Identifier", name: token.value}} as Param;
        }

        if (this.isLiteral(token.type)) {
            return {type: "Param", content: {type: TokenType[token.type] + "Literal", name: token.value}} as Param;    
        }

        // Must add check to complex types like function types, classes, arrays, structs, enums, etc.
        if (token.type == TokenType.OpenBrace) {
            // scope, class, dict, struct or enum
        }
        // a scope can be just an expression, so we need to check for that

        if (token.type == TokenType.OpenParenthesis) {
            // function type
        }

        if (token.type == TokenType.OpenBracket) {
            // array
        }

        throw new TokenError("wrooong" , token);
    }

    private parseParams(): Params {
        let params = [this.parseParam()];
        while (this.match(TokenType.Comma)) {
            params.push(this.parseParam());
        }
        return {type: "Params", params: params} as Params;
    }
    
    // an expression is probably more than that, but it'll do for now.
    private parseExpression(): Expr {
        let funcCall = this.parseFunctionCall();
        return {type: "Expression", value: funcCall};
    }


    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek()?.type === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private isAtEnd(): boolean {
        return this.peek()?.type === TokenType.EOF;
    }

    private previous(): Token {
        return this.tokens[this.current - 1];
    }


}
