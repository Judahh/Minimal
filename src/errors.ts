import { Token, TokenType } from "./lexer";

export class TokenError extends Error {
    static tokenMessage(token: Token): string {
        return `TokenError: ${token.typeName}:${TokenType[token.type]}:${token.type}:${token.value} at line ${token.line}, column ${token.column}`;
    }

    static toMessage(message: string, tokens: Token[] | Token): string {
        let newMessage = message;
        if (Array.isArray(tokens)) {
            newMessage += "\n" + tokens.map(token => TokenError.tokenMessage(token)).join("\n");
        } else {
            newMessage += "\n" + TokenError.tokenMessage(tokens);
        }
        return newMessage;
    }

    constructor(message: string, tokens: Token[] | Token) {
        super(TokenError.toMessage(message, tokens));
        this.name = "TokenError";
        
    }
}