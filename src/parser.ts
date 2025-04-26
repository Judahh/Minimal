import { TokenType, Token } from "./lexer";

interface ASTNode {
    type: string;
}

interface Stmt extends ASTNode{
    type: "Statement";
    statement: FunctionCall;
}

interface Stmts extends ASTNode{
    type: "Statements";
    statements: Stmt[];
}

interface NumberLiteral extends ASTNode {
    type: "NumberLiteral";
    value: number;
}

interface StringLiteral extends ASTNode {
    type: "StringLiteral";
    value: string;
}

interface Identifier extends ASTNode {
    type: "Identifier";
    name: string;
}

interface BinaryExpression extends ASTNode {
    type: "BinaryExpression";
    left: ASTNode;
    operator: string;
    right: ASTNode;
}

interface AssignmentExpression extends ASTNode {
    type: "AssignmentExpression";
    left: ASTNode;
    operator: string;
    right: ASTNode;
}

interface VariableDeclaration extends ASTNode {
    type: "VariableDeclaration";
    identifier: Identifier;
    value: ASTNode;
}

interface Scope extends ASTNode {
    type: "Scope";
    statements: Stmt | Stmts
}

interface ScopeExpression extends ASTNode {
    type: "ScopeExpression";
    expressions: ASTNode[];
}

interface BracketExpression extends ASTNode {
    type: "BracketExpression";
    expressions: ASTNode[];
}

interface ParamDefinition extends ASTNode {
    type: "ParamDefinition";
    name: Identifier;
    varType: Identifier;
}

interface ParamsDefinition extends ASTNode {
    type: "ParamsDefinition";
    parameters: ParamDefinition[];
}


interface Param extends ASTNode {
    type: "Param";
    identifier: Identifier;
}

interface Params extends ASTNode {
    type: "Params";
    params: Param[];
}

interface FunctionCall extends ASTNode {
    type: "FunctionCall";
    identifier: Identifier;
    params: Params;
}

interface FunctionDefinition extends ASTNode {
    type: "FunctionDefinition";
    params: Params;
    scope: Scope;
}

interface TypeAnnotation extends ASTNode {
    type: "TypeAnnotation";
    left: ASTNode;
    operator: string;
    right: ASTNode;
}

interface EOF extends ASTNode {
    type: "EOF";
}

export type Expression = NumberLiteral | Identifier | BinaryExpression | AssignmentExpression | ScopeExpression | BracketExpression | VariableDeclaration;

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
        while (this.current < this.tokens.length) {
            ast.push(this.parseStatement());
        }
        return ast;
    }

    private parseStatement(): Stmt {
        const funCall = this.parseFunctionCall()
        if (this.check(TokenType.SemiColon)){
            this.advance();
        }
        return {type: "Statement", statement: funCall} as Stmt
    }

    private parseStatements(): Stmts {
        ...
    }

    private parseVariableDeclaration(): VariableDeclaration {
        const identifier = this.consume();
        if (identifier.type !== TokenType.Identifier) {
            throw new Error("Expected identifier after 'var'");
        }
        if (!this.match(TokenType.Equals)) {
            throw new Error("Expected '=' in variable declaration");
        }
        const value = this.parseExpression();
        return {
            type: "VariableDeclaration",
            identifier: { type: "Identifier", name: identifier.value },
            value,
        };
    }

    private parseScope(): Scope {
        if (this.check(TokenType.OpenBrace)){
            ...
        }
    }

    private parseFunctionDefinition(): FunctionDefinition {
        let open: Boolean = false
        let params: ParamsDefinition;
        let scope: Scope;
        if (this.peek()?.type == TokenType.OpenParentesis) {
            open = true;
            this.advance();
        }
        params = this.parseParamsDefinition();
        if (open && !this.match(TokenType.CloseParentesis)){
            throw new Error("Unclosed parenthesis")
        }
        scope = parseScope();
        return {type: "FunctionDefinition", params: params, scope: scope} as FunctionDefinition
    }

    private parseFunctionCall(): FunctionCall {
        const identifier = this.consume();
        if (identifier.type !== TokenType.Identifier) {
            throw new Error("wroong");
        }
        if (!this.match(TokenType.OpenParentesis)) {
            throw new Error("wroong");
        }
        const params = this.parseParams();
        if (!this.match(TokenType.CloseParentesis)) {
            throw new Error("wroong");
        }

        return {identifier: {type: "Identifier", name: identifier.value}, params: params} as FunctionCall
    }

    private parseParamsDefinition(): ParamsDefinition {
        const params: ParamDefinition[] = []
        do {
            params.push(this.parseParamDefinition());
        } while(this.peek()?.type == TokenType.Comma && this.consume());

        return {parameters: params} as ParamsDefinition

    }

    private parseParamDefinition(): ParamDefinition {
        const name = this.consume();
        if (name.type != TokenType.Identifier){
            throw new Error("wrooong");
        }
        const type = this.consume();
        if (type.type != TokenType.Identifier) {
            throw new Error("wrooong");
        }
        if (!this.match(TokenType.Colon)){
            throw new Error("wroong");
        }

        return {type: "ParamDefinition", name: {type: "Identifier", name: name.value}, varType: {type: "Identifier", name: type.value}} as ParamDefinition
    }

    private parseFunctionParams(): FunctionParams {

    }

    private parseParam(): Param {
        const token = this.consume();
        // if (!(token.type == TokenType.Identifier) && !(token.type == TokenType.Literal))
        if (!(token.type == TokenType.Identifier)) {
            throw new Error("wroong");
        }
        return {type: "Param", identifier: {type: "Identifier", name: token.value}} as Param
    }

    private parseParams(): Params {
        let params = [this.parseParam()];
        while (this.match(TokenType.Comma)) {
            params.push(this.parseParam());
        }
        return {type: "Params", params: params} as Params;
    }

    // private parseTypeParams(): TypeParams {

    // }


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

    private parseExpression(): ASTNode {
        let left = this.parsePrimary();
    
        while (!this.isAtEnd() && (this.check(TokenType.OpenParentesis) || this.check(TokenType.Colon))) {
            if (this.check(TokenType.OpenParentesis)) {
                this.advance(); // Consume the '('
                const right = this.parseExpression();
                if (!this.match(TokenType.CloseParentesis)) {
                    throw new Error(`Expected ')' after expression ${this.tokens[this.current].line}:${this.tokens[this.current].column}`);
                }
                left = { type: "BinaryExpression", left, operator: "()", right } as BinaryExpression;
            } else if (this.check(TokenType.Colon)) {
                this.advance(); // Consume the ':'
                const right = this.parseExpression();
                left = { type: "TypeAnnotation", left, operator: ":", right } as TypeAnnotation;
            }
        }
    
        return left;
    }

    private parseBracketExpression(): ASTNode {
        const expressions: ASTNode[] = [];

        while (!this.isAtEnd() && !(this.check(TokenType.CloseBracket) && this.braceCount === 0)) {
            if (this.check(TokenType.OpenBracket)) {
                this.bracketCount++;
            } else if (this.check(TokenType.CloseBracket)) {
                this.bracketCount--;
            }
            expressions.push(this.parseExpression());
        }

        if (!this.match(TokenType.CloseBracket)) {
            throw new Error(`Expected ']' after scope expression ${this.tokens[this.current].line}:${this.tokens[this.current].column}`);
        }

        return { type: "BracketExpression", expressions } as BracketExpression;
    }

    private parseScopeExpression(): ASTNode {
        const expressions: ASTNode[] = [];

        while (!this.isAtEnd() && !(this.check(TokenType.CloseBrace) && this.braceCount === 0)) {
            if (this.check(TokenType.OpenBrace)) {
                this.braceCount++;
            } else if (this.check(TokenType.CloseBrace)) {
                this.braceCount--;
            }
            expressions.push(this.parseExpression());
        }

        if (!this.match(TokenType.CloseBrace)) {
            throw new Error(`Expected '}' after scope expression at ${this.tokens[this.current].line}:${this.tokens[this.current].column}`);
        }

        return { type: "ScopeExpression", expressions } as ScopeExpression;
    }

    private parsePrimary(): ASTNode {
        const token = this.consume();

        if (token.type === TokenType.Number) {
            return { type: "NumberLiteral", value: parseFloat(token.value) } as NumberLiteral;
        }
        if (token.type === TokenType.String) {
            return { type: "StringLiteral", value: token.value } as StringLiteral
        }
        if (token.type === TokenType.Identifier) {
            return { type: "Identifier", name: token.value } as Identifier;
        }
        if (token.type === TokenType.OpenParentesis) {
            const expression = this.parseExpression();
            if (!this.match(TokenType.CloseParentesis)) {
                throw new Error(`Expected ')' after expression '${JSON.stringify(expression)}' at ${token.line}:${token.column}`);
            }
            return expression;
        }
        if (token.type === TokenType.OpenBrace) {
            const expression = this.parseScopeExpression();
            if (!this.match(TokenType.CloseBrace)) {
                throw new Error(`Expected '}' after expression '${JSON.stringify(expression)}' at ${token.line}:${token.column}`);
            }
            return expression;
        }

        if (token.type === TokenType.OpenBracket) {
            const expression = this.parseBracketExpression();
            if (!this.match(TokenType.CloseBracket)) {
                throw new Error(`Expected ']' after expression '${JSON.stringify(expression)}' at ${token.line}:${token.column}`);
            }
            return expression;
        }

        if (token.type === TokenType.CustomOperator) {
            const left = this.parseExpression();
            const right = this.parseExpression();
            return { type: "BinaryExpression", left, operator: token.value, right } as BinaryExpression;
        }

        if (token.type === TokenType.SemiColon) {
            return { type: token.typeName } as ASTNode;
        }

        if (token.type === TokenType.Equals) {
            const left = this.parsePrimary();
            const right = this.parseExpression();
            return { type: "AssignmentExpression", left, operator: token.value, right } as AssignmentExpression;
        }

        if (token.type === TokenType.Colon) {
            const left = this.parsePrimary();
            const right = this.parseExpression();
            return { type: "TypeAnnotation", left, operator: token.value, right } as TypeAnnotation;
        }

        if (token.type === TokenType.Var) {
            return this.parseVariableDeclaration();
        }

        if (token.type === TokenType.EOF) {
            return { type: "EOF" } as ASTNode;
        }

        throw new Error(`Unexpected token: '${token.value}', type: ${token.type}`);
    }
}
