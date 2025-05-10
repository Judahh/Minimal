export enum TokenType {
	// Literal Types
	Number, // 0
	Identifier, // 1

	// Operators
	// Equals, // 2
	Hyphen, // 3
	CustomOperator, // 4
	// Grouping
	OpenParentesis, // 5 - (
	CloseParentesis, // 6 - )
	OpenBrace, // 7 - {
	CloseBrace, // 8 - }
	OpenBracket, // 9 - [
	CloseBracket, // 10 - ]
	// Punctuation
	Comma, // 11 - ,
	Dot, // 12 - .
	SemiColon, // 13 - ;
	Colon, // 14 - :
	// Arrow
	Arrow, // 15 - ->
	// Unkown
	Unknown, // 16
	// Var Keyword
	Var, // 17
	// Literal Types
	String, // 18
	TemplateString, // 19
	CharOrString, // 20
	// Skippable
	Skippable, // 21
	// Comment
	Comment, // 22
	// Escape
	Escape, // 23
	EOF, // 24
}


const simpleTokenToTokenType: { [str: string]: TokenType } = {
	// "=": TokenType.Equals,
	"-": TokenType.Hyphen,
	"(": TokenType.OpenParentesis,
	")": TokenType.CloseParentesis,
	"{": TokenType.OpenBrace,
	"}": TokenType.CloseBrace,
	"[": TokenType.OpenBracket,
	"]": TokenType.CloseBracket,
	"->": TokenType.Arrow,
	",": TokenType.Comma,
	".": TokenType.Dot,
	";": TokenType.SemiColon,
	":": TokenType.Colon,
	"\"": TokenType.String,
	"`": TokenType.TemplateString,
	"'": TokenType.CharOrString,
	"#": TokenType.Comment,
	"\\": TokenType.Escape,
	"$": TokenType.Var,
};


/**
 * Constant lookup for keywords and known identifiers + symbols.
 */
const KEYWORDS: Record<string, TokenType> = {
	// $: TokenType.Var,
	// "global": TokenType.Identifier,
	// "true": TokenType.Identifier,
	// "false": TokenType.Identifier,
	// "null": TokenType.Identifier,
	// "undefined": TokenType.Identifier,
	// "super": TokenType.Identifier,
	// "final": TokenType.Identifier,
	// "this": TokenType.Identifier,
	// "project": TokenType.Identifier,
	// "namespace": TokenType.Identifier,
	// "self": TokenType.Identifier,
	// "new": TokenType.Identifier,
};

// Reoresents a single token from the source-code.
export interface Token {
	value: string; // contains the raw value as seen inside the source code.
	type: TokenType; // tagged structure.
	typeName: string; // contains the name of the token type.
	isFinal?: boolean; // used to determine if the token is the last token in the source code.
	isInternal?: boolean; // used to determine if the token is an internal token.
	line: number; // contains the line number of the token.
	column: number; // contains the column number of the token.
}

// Returns a token of a given type and value
function token(value = "", type: TokenType, line: number, column: number, isFinal?: boolean): Token {
    if (isFinal) {
        return { value, type, isFinal, typeName: TokenType[type], line, column };
    } else if (type == TokenType.CustomOperator || type == TokenType.Arrow) {
        isFinal = false;
        return { value, type, isFinal, typeName: TokenType[type], line, column };
    }
    return { value, type, typeName: TokenType[type], line, column };
}

/**
 * Returns whether the character passed in alphabetic -> [a-zA-Z]
 */
function isAlpha(src: string) {
	return src.toUpperCase() != src.toLowerCase();
}

/**
 * Returns true if the character is whitespace like -> [\s, \t, \n]
 */
function isSkippable(str: string) {
	return str == " " || str == "\n" || str == "\t";
}

/**
 Return whether the character is a valid integer -> [0-9]
 */
function isInt(str: string) {
	const c = str.charCodeAt(0);
	const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];
	return c >= bounds[0] && c <= bounds[1];
}

function isHex(str: string) {
	const c = str.charCodeAt(0);
	const bounds = ["A".charCodeAt(0), "F".charCodeAt(0)];
	return (c >= bounds[0] && c <= bounds[1]) || isInt(str);
}

//function isReal(str: string) {
	// Examples:
	// 1.0
	// 1.0e10
	// 1.0e-10
	// 0.1
	// 0.1e10
	// .1
	// .1e10
//}

function isValidChar(str: string) {
	return isAlpha(str) || isInt(str) || isSkippable(str) || simpleTokenToTokenType[str] != undefined;
}

function getTokenType(str: string, lastToken: Token | undefined, line: number, column: number): Token {
	try {
		if (lastToken?.type == TokenType.Hyphen && !lastToken.isFinal && str == ">") {
			return token(lastToken.value + str, TokenType.Arrow, line, column);
		}
		const t = token(str, simpleTokenToTokenType[str], line, column);
		if (t.type == undefined || t.type == null || t.type == TokenType.Unknown) {
			throw new Error("Token not found");
		}
		return t;
	} catch (e) {
		return token(str, TokenType.Unknown, line, column);
	}
}

function groupLiteralTokens(tokens: Token[]): Token[] {
	// Group all literal tokens together.
	// Char and String
	// Group every token between the first and last literal token.
	// Example: [ { value: ':', type: 13 }, { value: 'PetFood', type: 1 }, { value: '"', type: TokenType.String }, { value: ",", type: TokenType.Comma }, { value: "World", type: TokenType.Identifier }, { value: ''', type: TokenType.Char }, { value: '"', type: TokenType.String } ] -> [ { value: ':', type: 13 }, { value: 'PetFood', type: 1 }, { value: '",World\'"', type: TokenType.String } ]
	let newTokens: Token[] = JSON.parse(JSON.stringify(tokens));
	let currentType: TokenType.TemplateString | TokenType.String | TokenType.CharOrString | undefined = undefined;
	let current: Token | undefined = undefined;
	let count: number = 0;
	for (let i = 0; i < newTokens.length; i++) {
		const t = newTokens[i];
		if (t.type == TokenType.String || t.type == TokenType.TemplateString || t.type == TokenType.CharOrString) {
			if (count == 0) {
				current = t;
				currentType = t.type;
				count++;
			} else if (count == 1 && current) {
				if(currentType == t.type) {
					current.value += t.value;
					currentType = undefined;
					count = 0;
				} else {
					current.value += t.value;
					newTokens.splice(i, 1);
					i--;
				}
			}
		} else {
			if (currentType && current) {
				current.value += t.value;
				newTokens.splice(i, 1);
				i--;
			}
		}
	}
	// remove single character string and char tokens.
	newTokens.forEach((t, i) => {
		if (t.type == TokenType.String || t.type == TokenType.TemplateString || t.type == TokenType.CharOrString) {
			if (t.value.length == 1) {
				newTokens.splice(i, 1);
			}
		}
	});
	newTokens = newTokens.map((t, i) => {
		// remove first and last character from string and char tokens.
		if (t.type == TokenType.String || t.type == TokenType.TemplateString || t.type == TokenType.CharOrString) {
			t.value = t.value.slice(1, t.value.length - 1);
		}
		return t;
	});
	return newTokens;
}

function removeSkippableTokens(tokens: Token[]): Token[] {
	return tokens.filter(t => t.type != TokenType.Skippable);
}

/**
 * Given a string representing source code: Produce tokens and handles
 * possible unidentified characters.
 *
 * - Returns a array of tokens.
 * - Does not modify the incoming string.
 */
export function tokenize(sourceCode: string): Token[] {
    const tokens = new Array<Token>();
    const src = sourceCode.split("");
    let lastToken: Token | undefined = undefined;
    let line = 1;
    let column = 1;

    // produce tokens until the EOF is reached.
    while (src.length > 0) {
        const char = src[0];

        // Handle new lines
        if (char === "\n") {
            line++;
            column = 1;
            src.shift();
            continue;
        }

        // BEGIN PARSING ONE CHARACTER TOKENS
        const tempToken = getTokenType(char, lastToken, line, column);
        if (tempToken.type != TokenType.Unknown) {
            if (lastToken?.type == TokenType.CustomOperator && (tempToken.type == TokenType.Arrow || tempToken.type == TokenType.Colon || tempToken.type == TokenType.Dot)) {
                tokens[tokens.length - 1].value += tempToken.value;
                tokens[tokens.length - 1].type = TokenType.CustomOperator;
                src.shift();
            } else if (tempToken.type == TokenType.Arrow) {
                // remove the last token and replace it with the arrow token.
                tokens.pop();
                tokens.push(token(tempToken.value, tempToken.type, line, column));
                src.shift();
            } else {
                tokens.push(token(tempToken.value, tempToken.type, line, column));
                src.shift();
                if (tempToken.type == TokenType.Comment) {
                    let counter = 1;
                    while (src.length > 0 && getTokenType(src[0], undefined, line, column).type == TokenType.Comment) {
                        counter++;
                        src.shift();
                    }
                    if (counter == 1) {
                        while (src.length > 0 && src[0] != "\n") {
                            tempToken.value += src[0];
                            src.shift();
                        }
                        // remove total tokens. from the beginning.
                        tempToken.value = tempToken.value.slice(1, tempToken.value.length);
                    } else {
                        const total = counter;
                        let backCounter = counter;
                        while (src.length > 0 && counter > 0) {
                            if (getTokenType(src[0], undefined, line, column).type == TokenType.Comment) {
                                backCounter--;
                            } else {
                                backCounter = counter;
                            }
                            tempToken.value += src[0];
                            src.shift();
                            if (backCounter == 0) {
                                counter = 0;
                                tempToken.isInternal = true;
                            }
                        }
                        // remove total tokens. from the beginning.
                        tempToken.value = tempToken.value.slice(total - 1, tempToken.value.length);
                        // remove total tokens from the end.
                        tempToken.value = tempToken.value.slice(0, tempToken.value.length - total);
                    }
                    tempToken.value = tempToken.value.trim();
                }
            }
        } else {
            if (!isValidChar(char)) {
                if (lastToken?.type == TokenType.CustomOperator || lastToken?.type == TokenType.Arrow) {
                    tokens[tokens.length - 1].value += src.shift();
                    tokens[tokens.length - 1].type = TokenType.CustomOperator;
                } else {
                    tokens.push(token(src.shift(), TokenType.CustomOperator, line, column));
                }
            } else {
                // Handle numeric literals -> Integers
                if (isInt(char)) {
                    let num = "";
                    while (src.length > 0 && isInt(src[0])) {
                        num += src.shift();
                    }

                    // append new numeric token.
                    tokens.push(token(num, TokenType.Number, line, column));
                } // Handle Identifier & Keyword Tokens.
                else if (isAlpha(char)) {
                    let ident = "";
                    while (src.length > 0 && isAlpha(src[0])) {
                        ident += src.shift();
                    }

                    // CHECK FOR RESERVED KEYWORDS
                    let reserved: TokenType | undefined = KEYWORDS[ident];
                    // If value is not undefined then the identifier is
                    // recognized keyword
                    if (reserved) {
                        tokens.push(token(ident, reserved, line, column));
                    } else {
                        // Unrecognized name must mean user defined symbol.
                        tokens.push(token(ident, TokenType.Identifier, line, column));
                    }
                } else if (isSkippable(char)) {
                    // Skip unneeded chars.
                    if (lastToken?.type == TokenType.CustomOperator || lastToken?.type == TokenType.Arrow) {
                        tokens[tokens.length - 1].isFinal = true;
                    }
                    tokens.push(token(src.shift(), TokenType.Skippable, line, column));
                } // Handle unrecognized characters.
                // TODO: Implement better errors and error recovery.
                else {
                    console.error(
                        "Unrecognized character found in source: ",
                        char.charCodeAt(0),
                        char
                    );
                    // Exit the program.
                    return [];
                }
            }
        }
        lastToken = tokens[tokens.length - 1];
        column++;
    }

    tokens.push(token("", TokenType.EOF, line, column));

    return removeSkippableTokens(groupLiteralTokens(tokens).map((t, i) => {
        delete t.isFinal;
        return t;
    }));
}