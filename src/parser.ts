import { ParseError } from "./errors";
import { Token, TokenType } from "./lexer";
import { ASTNode, Scope, FunctionCall, NumberLiteral, StringLiteral, CharLiteral, TemplateStringLiteral, Identifier, FunctionDefinition, Param, ParamDefinition, Expression, BinaryExpression, AssignmentExpression, ScopeExpression, ArrayLiteral, EOF } from "./aST";

export class Parser {
    private tokens: Token[];
    private current: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    public parse(): ASTNode[] {
        const ast: ASTNode[] = [];
        while (!this.isAtEnd()) {
            ast.push(this.parseStatement());
        }
        ast.push({ type: "EOF" } as EOF);
        return ast;
    }

    // private parseStatement(): Statement {
    //     const expr = this.parseExpression();
    //     this.consume(TokenType.Semicolon);
    //     return { type: "ExpressionStatement", expression: expr };
    // }

    private parseStatement(): ASTNode {
        if (this.check(TokenType.OpenBrace)) {
            return this.parseScope();
        } else if (this.check(TokenType.Identifier)) {
            const lookahead = this.tokens[this.current + 1];
            if (lookahead && lookahead.type === TokenType.Colon) {
                const assignment = this.parseAssignment();
                this.consumeOptionalSemicolon();
                return assignment;
            }
            const expr = this.parseExpression();
            this.consumeOptionalSemicolon();
            return expr;
        } else if (this.isLiteral(this.peek()?.type)) {
            const expr = this.parseExpression();
            this.consumeOptionalSemicolon();
            return expr;
        } else if (this.check(TokenType.OpenParenthesis)) {
            const expr = this.parseExpression();
            this.consumeOptionalSemicolon();
            return expr;
        } else if (this.check(TokenType.SemiColon)) {
            // Allow empty statement
            this.advance();
            return { type: "EmptyStatement" };
        } else {
            throw new ParseError("Unrecognized statement", this.peek());
        }
    }
    
    private consumeOptionalSemicolon(): void {
        if (this.check(TokenType.SemiColon)) {
            this.advance();
        }
    }

    private parseAssignment(): AssignmentExpression {
        const identifier = this.consume(TokenType.Identifier);
        this.consume(TokenType.Colon);
        const value = this.parseExpression();
        return {
            type: "AssignmentExpression",
            identifier: { type: "Identifier", name: identifier.value },
            value
        };
    }

    private parseScope(): Scope {
        this.match(TokenType.OpenBrace);
        const statements: ASTNode[] = [];
        while (!this.isAtEnd() && !this.check(TokenType.CloseBrace)) {
            statements.push(this.parseStatement());
        }
        if (!this.match(TokenType.CloseBrace)) {
            throw new ParseError("Unclosed scope", this.peek());
        }
        return { type: "Scope", statements };
    }

    private isOperator(token: Token): boolean {
        return token.type === TokenType.Identifier && /^[+\-*/<>!=|&]+$/.test(token.lexeme);
    }

    private parseExpression(): Expression {
        let expr = this.parsePrimary();
    
        while (this.isOperator(this.peek())) {
            const operator = this.advance().lexeme;
            const right = this.parsePrimary();
    
            expr = {
                type: "BinaryExpression",
                left: expr,
                operator,
                right
            };
        }
    
        return expr;
    }

    private parseOperatorChain(): Expression {
        let expr = this.parsePrimary();

        while (!this.isAtEnd() && this.isOperatorToken(this.peek())) {
            const operator = this.advance();
            const right = this.parsePrimary();

            // Represent all operators as FunctionCall: e.g., '+' => FunctionCall('+', [left, right])
            expr = {
                type: "FunctionCall",
                identifier: { type: "Identifier", name: operator.value },
                params: [
                    { type: "Param", content: expr },
                    { type: "Param", content: right }
                ]
            };
        }
        return expr;
    }

    private parsePrimary(): Expression {
        const token = this.peek();
    
        if (this.match(TokenType.OpenParenthesis)) {
            const expr = this.parseExpression();
            this.consume(TokenType.CloseParenthesis);
    
            // After parenthesis, check for chaining
            if (this.check(TokenType.Identifier) || this.check(TokenType.OpenParenthesis)) {
                const right = this.parsePrimary();
                return {
                    type: "ApplyExpression",
                    base: expr,
                    argument: right
                };
            }
    
            return expr;
        }
    
        if (this.match(TokenType.Identifier)) {
            const name = token.lexeme;
    
            // If immediately followed by (, treat as function call
            if (this.check(TokenType.OpenParenthesis)) {
                return this.parseFunctionCall(name);
            }
    
            return {
                type: "Identifier",
                name
            };
        }
    
        if (this.match(TokenType.String)) {
            return { type: "StringLiteral", value: token.value };
        }
    
        if (this.match(TokenType.Number)) {
            return { type: "NumberLiteral", value: Number(token.value) };
        }
    
        throw new ParseError(`Unrecognized primary expression`, token);
    }

    private parseFunctionCall(name: string): Expression {
        const args = this.parseParams();
        return {
            identifier: { type: "Identifier", name },
            type: "FunctionCall",
            caller: { type: "Identifier", name },
            params: args
        };
    }

    private parseParams(): Param[] {
        const params: Param[] = [];
    
        this.consume(TokenType.OpenParenthesis);
    
        if (!this.check(TokenType.CloseParenthesis)) {
            do {
                const expr = this.parseParam();
                params.push(expr);
            } while (this.match(TokenType.Comma));
        }
    
        this.consume(TokenType.CloseParenthesis);
        return params;
    }

    private parseParam(): Param {
        const expr = this.parseExpression();
        return { type: "Param", content: expr };
    }

    private parseScopeExpression(): ScopeExpression {
        const scope = this.parseScope();
        return { type: "ScopeExpression", scope };
    }

    private tokenToLiteral(token: Token): NumberLiteral | CharLiteral | StringLiteral | TemplateStringLiteral {
        switch (token.type) {
            case TokenType.Number:
                return { type: "NumberLiteral", value: Number(token.value) };
            case TokenType.String:
                return { type: "StringLiteral", value: token.value };
            case TokenType.Char:
                return { type: "CharLiteral", value: token.value };
            case TokenType.TemplateString:
                return { type: "TemplateStringLiteral", value: token.value };
            default:
                throw new ParseError("Unknown literal", token);
        }
    }

    private consume(expectedType: TokenType): Token {
        if (this.check(expectedType)) {
            return this.advance();
        }
        throw new ParseError(`Expected token type ${TokenType[expectedType]}`, this.peek());
    }

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    private isAtEnd(): boolean {
        return this.peek().type === TokenType.EOF;
    }

    private peek(): Token {
        return this.tokens[this.current];
    }

    private previous(): Token {
        return this.tokens[this.current - 1];
    }

    private isLiteral(type: TokenType | undefined): boolean {
        return type === TokenType.Number ||
            type === TokenType.String ||
            type === TokenType.Char ||
            type === TokenType.TemplateString;
    }

    private isOperatorToken(token: Token): boolean {
        // Only ':' is syntactic assignment, all others are user-defined operators
        return token.type === TokenType.Operator;
    }
}
