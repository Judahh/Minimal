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

    private parseStatement(): ASTNode {
        if (this.check(TokenType.OpenBrace)) {
            return this.parseScope();
        } else if (this.check(TokenType.Identifier)) {
            const lookahead = this.tokens[this.current + 1];
            if (lookahead && lookahead.type === TokenType.OpenParenthesis) {
                return this.parseFunctionCall();
            }
            return this.parseExpression();
        } else if (this.isLiteral(this.peek()?.type)) {
            return this.parseExpression();
        } else {
            throw new ParseError("Unrecognized statement", this.peek());
        }
    }

    private parseScope(): Scope {
        this.match(TokenType.OpenBrace);
        const statements: (ASTNode)[] = [];

        while (!this.isAtEnd() && !this.check(TokenType.CloseBrace)) {
            statements.push(this.parseStatement());
        }

        if (!this.match(TokenType.CloseBrace)) {
            throw new ParseError("Unclosed scope", this.peek());
        }

        return { type: "Scope", statements };
    }

    private parseFunctionCall(): FunctionCall {
        const identifier = this.consume(TokenType.Identifier);
        const params = this.parseParams();
        return {
            type: "FunctionCall",
            identifier: { type: "Identifier", name: identifier.value },
            params
        };
    }

    private parseParams(): Param[] {
        const params: Param[] = [];
        if (this.match(TokenType.OpenParenthesis)) {
            while (!this.isAtEnd() && !this.check(TokenType.CloseParenthesis)) {
                params.push(this.parseParam());
                this.match(TokenType.Comma);
            }
            if (!this.match(TokenType.CloseParenthesis)) {
                throw new ParseError("Unclosed parameter list", this.peek());
            }
        }
        return params;
    }

    private parseParam(): Param {
        if (this.check(TokenType.OpenParenthesis)) {
            return { type: "Param", content: this.parseExpression() };
        } else if (this.check(TokenType.OpenBrace)) {
            return { type: "Param", content: this.parseScope() };
        } else if (this.check(TokenType.Identifier)) {
            const token = this.consume(TokenType.Identifier);
            return { type: "Param", content: { type: "Identifier", name: token.value } };
        } else if (this.isLiteral(this.peek()?.type)) {
            const literal = this.tokenToLiteral(this.consume(TokenType.Identifier));
            return { type: "Param", content: literal };
        }
        throw new ParseError("Unexpected token in parameter", this.peek());
    }

    private parseFunctionDefinition(): FunctionDefinition {
        this.match(TokenType.OpenBrace);
        const identifier = this.consume(TokenType.Identifier);
        const params = this.parseParamsDefinition();
        const body = this.parseScope();

        return {
            type: "FunctionDefinition",
            identifier: { type: "Identifier", name: identifier.value },
            params,
            body
        };
    }

    private parseParamsDefinition(): ParamDefinition[] {
        const params: ParamDefinition[] = [];
        if (this.match(TokenType.OpenParenthesis)) {
            while (!this.isAtEnd() && !this.check(TokenType.CloseParenthesis)) {
                const param = this.parseParamDefinition();
                params.push(param);
                this.match(TokenType.Comma);
            }
            if (!this.match(TokenType.CloseParenthesis)) {
                throw new ParseError("Unclosed parameter definition list", this.peek());
            }
        }
        return params;
    }

    private parseParamDefinition(): ParamDefinition {
        const nameToken = this.consume(TokenType.Identifier);
        let typeAnnotation: string | undefined;

        if (this.match(TokenType.Colon)) {
            const typeToken = this.consume(TokenType.Identifier);
            typeAnnotation = typeToken.value;
        }

        return {
            type: "ParamDefinition",
            identifier: { type: "Identifier", name: nameToken.value },
            annotation: typeAnnotation
        };
    }

    private parseExpression(): Expression {
        if (this.check(TokenType.Identifier)) {
            const lookahead = this.tokens[this.current + 1];
            if (lookahead && lookahead.type === TokenType.OpenParenthesis) {
                return this.parseFunctionCall();
            } else {
                const token = this.consume(TokenType.Identifier);
                return { type: "Identifier", name: token.value };
            }
        } else if (this.isLiteral(this.peek()?.type)) {
            return this.tokenToLiteral(this.consume(TokenType.Identifier));
        } else if (this.check(TokenType.OpenParenthesis)) {
            this.advance();
            const expr = this.parseExpression();
            if (!this.match(TokenType.CloseParenthesis)) {
                throw new ParseError("Unclosed parenthesis in expression", this.peek());
            }
            return expr;
        } else if (this.check(TokenType.OpenBrace)) {
            return this.parseScopeExpression();
        }
        throw new ParseError("Unrecognized expression", this.peek());
    }

    private parseScopeExpression(): ScopeExpression {
        const scope = this.parseScope();
        return {
            type: "ScopeExpression",
            scope
        };
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
        throw new ParseError(`Expected token type ${expectedType} ${TokenType[expectedType]}`, this.peek());
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
}
