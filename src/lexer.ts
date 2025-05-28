export enum TokenType {
	// Literal Types
	Identifier, // 0
	Number, // 1
	String, // 2
	TemplateString, // 3
	Char, // 4

	// Operators
	// Equals, // 5
	Hyphen, // 5
	Operator, // 6
	// Grouping
	OpenParenthesis, // 7 - (
	CloseParenthesis, // 8 - )
	OpenBrace, // 9 - {
	CloseBrace, // 10 - }
	OpenBracket, // 11 - [
	CloseBracket, // 12 - ]
	// Punctuation
	Comma, // 13 - ,
	Dot, // 14 - .
	SemiColon, // 15 - ;
	Colon, // 16 - :
	// Arrow
	Arrow, // 17 - ->
	// Unkown
	Unknown, // 18
	// Var Keyword
	Var, // 19
	// Skippable
	Skippable, // 20
	// Comment
	Comment, // 21
	// Escape
	Escape, // 22
	EOF, // 23
}


const simpleTokenToTokenType: { [str: string]: TokenType } = {
	// "=": TokenType.Equals,
	"-": TokenType.Hyphen,
	"(": TokenType.OpenParenthesis,
	")": TokenType.CloseParenthesis,
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
	"'": TokenType.Char,
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
    } else if (type == TokenType.Operator || type == TokenType.Arrow) {
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

function isReal(char: string): boolean {
    return char >= '0' && char <= '9' || char === '.';
}

function isEscapeChar(char: string): boolean {
    return char === '\\';
}

const MULTI_CHAR_OPERATORS = ['==', '!=', '>=', '<=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '%='];

function getMultiCharOperator(src: string[]): string | null {
    for (const op of MULTI_CHAR_OPERATORS) {
        if (src.slice(0, op.length).join('') === op) {
            return op;
        }
    }
    return null;
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
	let currentType: TokenType.TemplateString | TokenType.String | TokenType.Char | undefined = undefined;
	let current: Token | undefined = undefined;
	let count: number = 0;
	for (let i = 0; i < newTokens.length; i++) {
		const t = newTokens[i];
		if (t.type == TokenType.String || t.type == TokenType.TemplateString || t.type == TokenType.Char) {
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
		if (t.type == TokenType.String || t.type == TokenType.TemplateString || t.type == TokenType.Char) {
			if (t.value.length == 1) {
				newTokens.splice(i, 1);
			}
		}
	});
	newTokens = newTokens.map((t, i) => {
		// remove first and last character from string and char tokens.
		if (t.type == TokenType.String || t.type == TokenType.TemplateString || t.type == TokenType.Char) {
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
    const tokens: Token[] = [];
    const src = sourceCode.split('');
    let line = 1;
    let column = 1;
    let lastToken: Token | undefined = undefined;

    while (src.length > 0) {
        let char = src.shift()!;
        let startLine = line;
        let startColumn = column;

        if (char === '\n') {
            line++;
            column = 1;
        } else {
            column++;
        }

        if (isSkippable(char)) {
            tokens.push(token(char, TokenType.Skippable, startLine, startColumn));
            lastToken = tokens[tokens.length - 1];
            continue;
        }

        if (char === '#' && src[0] !== undefined) {
            let commentValue = char;
            while (src[0] !== '\n' && src.length > 0) {
                commentValue += src.shift();
                column++;
            }
            tokens.push(token(commentValue, TokenType.Comment, startLine, startColumn));
            lastToken = tokens[tokens.length - 1];
            continue;
        }

        // Multi-character operators
        const multiOp = getMultiCharOperator([char, ...src]);
        if (multiOp) {
            for (let i = 1; i < multiOp.length; i++) {
                src.shift();
                column++;
            }
            tokens.push(token(multiOp, TokenType.Operator, startLine, startColumn));
            lastToken = tokens[tokens.length - 1];
            continue;
        }

        if (simpleTokenToTokenType[char]) {
            const simpleTok = getTokenType(char, lastToken, startLine, startColumn);
            tokens.push(simpleTok);
            lastToken = simpleTok;
            continue;
        }

        // Numbers (integers and floats)
        if (isInt(char) || (char === '.' && isInt(src[0]))) {
            let numberValue = char;
            let dotCount = char === '.' ? 1 : 0;
            while (src.length > 0 && isReal(src[0])) {
                const nextChar = src.shift()!;
                if (nextChar === '.') dotCount++;
                numberValue += nextChar;
                column++;
            }
            if (dotCount > 1) {
                throw new Error(`Invalid number with multiple decimal points at ${startLine}:${startColumn}`);
            }
            tokens.push(token(numberValue, TokenType.Number, startLine, startColumn));
            lastToken = tokens[tokens.length - 1];
            continue;
        }

        // Strings, chars, template strings
        if (char === '"' || char === "'" || char === '`') {
            const closingChar = char;
            let strValue = char;
            let escaped = false;
            while (src.length > 0) {
                const nextChar = src.shift()!;
                column++;
                strValue += nextChar;
                if (escaped) {
                    escaped = false;
                    continue;
                }
                if (isEscapeChar(nextChar)) {
                    escaped = true;
                    continue;
                }
                if (nextChar === closingChar) break;
            }
            if (strValue[strValue.length - 1] !== closingChar) {
                throw new Error(`Unterminated string at ${startLine}:${startColumn}`);
            }
            let tokType = TokenType.String;
            if (char === "'") tokType = TokenType.Char;
            if (char === '`') tokType = TokenType.TemplateString;

            tokens.push(token(strValue, tokType, startLine, startColumn));
            lastToken = tokens[tokens.length - 1];
            continue;
        }

        // Identifiers and keywords
        if (isAlpha(char)) {
            let ident = char;
            while (src.length > 0 && (isAlpha(src[0]) || isInt(src[0]))) {
                ident += src.shift();
                column++;
            }
            const keywordType = KEYWORDS[ident];
            const tokType = keywordType !== undefined ? keywordType : TokenType.Identifier;
            tokens.push(token(ident, tokType, startLine, startColumn));
            lastToken = tokens[tokens.length - 1];
            continue;
        }

        // Fallback: unknown tokens
        tokens.push(token(char, TokenType.Unknown, startLine, startColumn));
        lastToken = tokens[tokens.length - 1];
    }

    tokens.push(token('EOF', TokenType.EOF, line, column));
    return removeSkippableTokens(groupLiteralTokens(tokens));
}