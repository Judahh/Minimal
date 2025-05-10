import { Token, TokenType } from "./lexer";
import { ASTNode } from "./parser";

export class TokenError extends Error {
    static tokenMessage(token: Token): string {
        return `${token.typeName}:${TokenType[token.type]}:${token.type}:${token.value} at line ${token.line}, column ${token.column}`;
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

export class ASTNodeError extends Error {
    static aSTNodeMessage(aSTNode: ASTNode): string {
        return `${aSTNode.type}`;
    }

    static toMessage(message: string, aSTNodes: ASTNode[] | ASTNode): string {
        let newMessage = message;
        if (Array.isArray(aSTNodes)) {
            newMessage += "\n" + aSTNodes.map(aSTNode => ASTNodeError.aSTNodeMessage(aSTNode)).join("\n");
        } else {
            newMessage += "\n" + ASTNodeError.aSTNodeMessage(aSTNodes);
        }
        return newMessage;
    }

    constructor(message: string, aSTNodes: ASTNode[] | ASTNode) {
        super(ASTNodeError.toMessage(message, aSTNodes));
        this.name = "ASTNodeError";
    }
}