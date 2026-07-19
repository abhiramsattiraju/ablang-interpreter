let StreamWalker = require('./stream_walker.js');
const tokenTypes = require('./token_types.js');
const exceptions = require('./exceptions.js');

const DIGITS = '1234567890';
const OPERATORS = ['+', '-', '*', '/', '>', '<', '>=', '<=', '==', '!='];
const NAME_PERMITTED_FIRST_CHARS =
    '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NAME_ALL_PERMITTED_CHARS =
    '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const WHITESPACES = ' \t\n\r';
const KEYWORDS = ['print', 'True', 'False', 'if'];
const Token = require('./token_class.js');

// Takes ABLang source code in a string and returns a token stream or a list of
// tokens.
function lex(source_code) {
    let sourceCodeWalker = new StreamWalker(source_code);
    let tokenStream = [];

    // Loop through the source code.
    while (!sourceCodeWalker.reached_end()) {
        if (sourceCodeWalker.currentElement === '(') {
            lexRoundBracket(sourceCodeWalker, tokenStream, '(');
        } else if (sourceCodeWalker.currentElement === ')') {
            lexRoundBracket(sourceCodeWalker, tokenStream, ')');
        } else if (DIGITS.includes(sourceCodeWalker.currentElement)) {
            lexNumber(sourceCodeWalker, tokenStream);
        } else if (sourceCodeWalker.currentElement === ';') {
            exceptions.raiseException(exceptions.SYNTAX_ERROR,
                'Semicolons are not allowed.');
        } else if (sourceCodeWalker.currentElement === '"') {
            lexString(sourceCodeWalker, tokenStream);
        } else if (isStartOfOperator(sourceCodeWalker.currentElement)) {
            lexOperator(sourceCodeWalker, tokenStream);
        } else if (NAME_PERMITTED_FIRST_CHARS.includes(
            sourceCodeWalker.currentElement
        )) {
            lexNameOrKeyword(sourceCodeWalker, tokenStream);
        } else if (sourceCodeWalker.currentElement === ':') {
            lexColon(sourceCodeWalker, tokenStream);
        } else if (WHITESPACES.includes(sourceCodeWalker.currentElement)) {
            lexWhitespace(sourceCodeWalker, tokenStream);
        } else {
            exceptions.raiseException(exceptions.SYNTAX_ERROR,
                `Invalid character "${sourceCodeWalker.currentElement}"`);
        }
    }

    return tokenStream;
}

function lexWhitespace(sourceCodeWalker, tokenStream) {
    while (WHITESPACES.includes(sourceCodeWalker.currentElement)) {
        if (sourceCodeWalker.currentElement === '\n') {
            tokenStream.push(new Token(
                tokenTypes.TOKEN_TYPE_NEWLINE, '\n'
            ));
        }
        sourceCodeWalker.forward();
    }
}

function lexRoundBracket(sourceCodeWalker, tokenStream, bracket) {
    tokenStream.push(new Token(
        tokenTypes.TOKEN_TYPE_ROUND_BRACKET, bracket
    ));
    sourceCodeWalker.forward();
}

function lexNumber(sourceCodeWalker, tokenStream) {
    let num = '';

    while(DIGITS.includes(sourceCodeWalker.currentElement) &&
        (!sourceCodeWalker.reached_end())) {
        num += sourceCodeWalker.currentElement;
        sourceCodeWalker.forward();
    }

    tokenStream.push(new Token(
        tokenTypes.TOKEN_TYPE_NUMBER, parseInt(num)
    ));

    if(NAME_PERMITTED_FIRST_CHARS.includes(sourceCodeWalker.currentElement)) {
        exceptions.raiseException(exceptions.SYNTAX_ERROR,
            `Invalid number '${num}${sourceCodeWalker.currentElement}'`);
    }
}

function lexString(sourceCodeWalker, tokenStream) {
    let string = '';
    sourceCodeWalker.forward();
    while (sourceCodeWalker.currentElement !== '"') {
        if (sourceCodeWalker.reached_end()) {
            exceptions.raiseException(exceptions.SYNTAX_ERROR,
                'Unterminated string.');
        }

        string += sourceCodeWalker.currentElement;
        sourceCodeWalker.forward();
    }
    sourceCodeWalker.forward();
    tokenStream.push(new Token(
        tokenTypes.TOKEN_TYPE_STRING, string
    ));
}

function lexOperator(sourceCodeWalker, tokenStream) {
    let operatorValue = '';

    for(let i = 0; isCharacterOfOperator(sourceCodeWalker.currentElement); i++) {
        operatorValue += sourceCodeWalker.currentElement;
        sourceCodeWalker.forward();

        if (sourceCodeWalker.reached_end()) {
            exceptions.raiseException(exceptions.SYNTAX_ERROR,
                `Unterminated operator '${operatorValue}'`);
        }
    }

    if(!OPERATORS.includes(operatorValue)) {
        exceptions.raiseException(exceptions.SYNTAX_ERROR,
            `Invalid operator '${operatorValue}'`);
    }

    tokenStream.push(
        new Token(
            tokenTypes.TOKEN_TYPE_OPERATOR,
            operatorValue
        )
    );
}

function isCharacterOfOperator(character) {
    let result = false;

    OPERATORS.forEach((operator) => {
        if (operator.includes(character)) {
            result = true;
        }
    });

    return result;
}

function lexColon(sourceCodeWalker, tokenStream) {
    tokenStream.push(new Token(
        tokenTypes.TOKEN_TYPE_COLON, ':'
    ));
    sourceCodeWalker.forward();
}

function lexNameOrKeyword(sourceCodeWalker, tokenStream) {
    let nameName = '';

    while(
        NAME_ALL_PERMITTED_CHARS.includes(
            sourceCodeWalker.currentElement
        ) && (!sourceCodeWalker.reached_end())
    ) {
        nameName += sourceCodeWalker.currentElement;
        sourceCodeWalker.forward();
    }

    if(KEYWORDS.includes(nameName)) {
        tokenStream.push(new Token(
            tokenTypes.TOKEN_TYPE_KEYWORD, nameName
        ));
        return;
    }

    tokenStream.push(new Token(
        tokenTypes.TOKEN_TYPE_NAME, nameName
    ));
}

function isStartOfOperator(character) {
    let foundOperator = false;

    OPERATORS.forEach((operator) => {
        if (operator[0] === character) {
            foundOperator = true;
        }
    });

    return foundOperator;
}

module.exports = lex;
