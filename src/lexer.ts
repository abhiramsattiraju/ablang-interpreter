import { StreamWalker } from "./stream_walker";
import * as tokenTypes from "./token_types";
import * as exceptions from "./exceptions";
import { Token } from "./token_class";

const DIGITS = "1234567890";
const OPERATORS = ["+", "-", "*", "/", ">", "<", ">=", "<=", "==", "!="];
const NAME_PERMITTED_FIRST_CHARS =
    "_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NAME_ALL_PERMITTED_CHARS =
    "_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const WHITESPACES = " \t\n\r";
const KEYWORDS = ["print", "True", "False", "if"];

// Takes ABLang source code in a string and returns a token stream or a list of
// tokens.
export default function lex(source_code: string): Token[] {
    const sourceCodeWalker = new StreamWalker<string>(source_code);
    const tokenStream: Token[] = [];

    // Loop through the source code.
    while (!sourceCodeWalker.reached_end()) {
        const current = sourceCodeWalker.currentElement;
        if (current === null) {
            break;
        }

        if (current === "(") {
            lexRoundBracket(sourceCodeWalker, tokenStream, "(");
        } else if (current === ")") {
            lexRoundBracket(sourceCodeWalker, tokenStream, ")");
        } else if (DIGITS.includes(current)) {
            lexNumber(sourceCodeWalker, tokenStream);
        } else if (current === ";") {
            exceptions.raiseException(
                exceptions.SYNTAX_ERROR,
                "Semicolons are not allowed."
            );
        } else if (current === '"') {
            lexString(sourceCodeWalker, tokenStream);
        } else if (isStartOfOperator(current)) {
            lexOperator(sourceCodeWalker, tokenStream);
        } else if (NAME_PERMITTED_FIRST_CHARS.includes(current)) {
            lexNameOrKeyword(sourceCodeWalker, tokenStream);
        } else if (current === ":") {
            lexColon(sourceCodeWalker, tokenStream);
        } else if (WHITESPACES.includes(current)) {
            lexWhitespace(sourceCodeWalker, tokenStream);
        } else {
            exceptions.raiseException(
                exceptions.SYNTAX_ERROR,
                `Invalid character "${current}"`
            );
        }
    }

    return tokenStream;
}

function lexWhitespace(sourceCodeWalker: StreamWalker<string>, tokenStream: Token[]): void {
    while (
        sourceCodeWalker.currentElement !== null &&
        WHITESPACES.includes(sourceCodeWalker.currentElement)
    ) {
        if (sourceCodeWalker.currentElement === "\n") {
            tokenStream.push(new Token(tokenTypes.TOKEN_TYPE_NEWLINE, "\n"));
        }
        sourceCodeWalker.forward();
    }
}

function lexRoundBracket(
    sourceCodeWalker: StreamWalker<string>,
    tokenStream: Token[],
    bracket: string
): void {
    tokenStream.push(new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, bracket));
    sourceCodeWalker.forward();
}

function lexNumber(sourceCodeWalker: StreamWalker<string>, tokenStream: Token[]): void {
    let num = "";

    while (
        sourceCodeWalker.currentElement !== null &&
        DIGITS.includes(sourceCodeWalker.currentElement) &&
        !sourceCodeWalker.reached_end()
    ) {
        num += sourceCodeWalker.currentElement;
        sourceCodeWalker.forward();
    }

    tokenStream.push(new Token(tokenTypes.TOKEN_TYPE_NUMBER, parseInt(num, 10)));

    if (
        sourceCodeWalker.currentElement !== null &&
        NAME_PERMITTED_FIRST_CHARS.includes(sourceCodeWalker.currentElement)
    ) {
        exceptions.raiseException(
            exceptions.SYNTAX_ERROR,
            `Invalid number '${num}${sourceCodeWalker.currentElement}'`
        );
    }
}

function lexString(sourceCodeWalker: StreamWalker<string>, tokenStream: Token[]): void {
    let string = "";
    sourceCodeWalker.forward();
    while (sourceCodeWalker.currentElement !== '"') {
        if (sourceCodeWalker.reached_end() || sourceCodeWalker.currentElement === null) {
            exceptions.raiseException(exceptions.SYNTAX_ERROR, "Unterminated string.");
        }

        string += sourceCodeWalker.currentElement;
        sourceCodeWalker.forward();
    }
    sourceCodeWalker.forward();
    tokenStream.push(new Token(tokenTypes.TOKEN_TYPE_STRING, string));
}

function lexOperator(sourceCodeWalker: StreamWalker<string>, tokenStream: Token[]): void {
    let operatorValue = "";

    while (
        sourceCodeWalker.currentElement !== null &&
        isCharacterOfOperator(sourceCodeWalker.currentElement)
    ) {
        operatorValue += sourceCodeWalker.currentElement;
        sourceCodeWalker.forward();

        if (sourceCodeWalker.reached_end()) {
            exceptions.raiseException(
                exceptions.SYNTAX_ERROR,
                `Unterminated operator '${operatorValue}'`
            );
        }
    }

    if (!OPERATORS.includes(operatorValue)) {
        exceptions.raiseException(
            exceptions.SYNTAX_ERROR,
            `Invalid operator '${operatorValue}'`
        );
    }

    tokenStream.push(new Token(tokenTypes.TOKEN_TYPE_OPERATOR, operatorValue));
}

function isCharacterOfOperator(character: string | null): boolean {
    if (character === null) return false;
    let result = false;

    OPERATORS.forEach((operator) => {
        if (operator.includes(character)) {
            result = true;
        }
    });

    return result;
}

function lexColon(sourceCodeWalker: StreamWalker<string>, tokenStream: Token[]): void {
    tokenStream.push(new Token(tokenTypes.TOKEN_TYPE_COLON, ":"));
    sourceCodeWalker.forward();
}

function lexNameOrKeyword(sourceCodeWalker: StreamWalker<string>, tokenStream: Token[]): void {
    let nameName = "";

    while (
        sourceCodeWalker.currentElement !== null &&
        NAME_ALL_PERMITTED_CHARS.includes(sourceCodeWalker.currentElement) &&
        !sourceCodeWalker.reached_end()
    ) {
        nameName += sourceCodeWalker.currentElement;
        sourceCodeWalker.forward();
    }

    if (KEYWORDS.includes(nameName)) {
        tokenStream.push(new Token(tokenTypes.TOKEN_TYPE_KEYWORD, nameName));
        return;
    }

    tokenStream.push(new Token(tokenTypes.TOKEN_TYPE_NAME, nameName));
}

function isStartOfOperator(character: string | null): boolean {
    if (character === null) return false;
    let foundOperator = false;

    OPERATORS.forEach((operator) => {
        if (operator[0] === character) {
            foundOperator = true;
        }
    });

    return foundOperator;
}
