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
const KEYWORDS = ['print'];
const Token = require('./token_class.js');

// Takes ABLang source code in a string and returns a token stream or a list of
// tokens.
function lex(source_code) {
    let sourceCodeWalker = new StreamWalker(source_code);
    let token_stream = [];

    // Loop through the source code.
    while (!sourceCodeWalker.reached_end()) {
        if (sourceCodeWalker.currentElement === '(') {
            lexRoundBracket(sourceCodeWalker, token_stream, '(');
        } else if (sourceCodeWalker.currentElement === ')') {
            lexRoundBracket(sourceCodeWalker, token_stream, ')');
        } else if (DIGITS.includes(sourceCodeWalker.currentElement)) {
            lexNumber(sourceCodeWalker, token_stream);
        } else if (sourceCodeWalker.currentElement === ';') {
            lexSemicolon(sourceCodeWalker, token_stream);
        } else if (sourceCodeWalker.currentElement === '"') {
            lexString(sourceCodeWalker, token_stream);
        } else if (isStartOfOperator(sourceCodeWalker.currentElement)) {
            lexOperator(sourceCodeWalker, token_stream);
        } else if (NAME_PERMITTED_FIRST_CHARS.includes(
            sourceCodeWalker.currentElement
        )) {
            lexNameOrKeyword(sourceCodeWalker, token_stream);
        } else if (WHITESPACES.includes(sourceCodeWalker.currentElement)) {
            sourceCodeWalker.forward();
        } else {
            exceptions.raiseException(exceptions.SYNTAX_ERROR,
                `Invalid character "${sourceCodeWalker.currentElement}"`);
        }
    }

    return token_stream;
}

function lexRoundBracket(sourceCodeWalker, token_stream, bracket) {
    token_stream.push(new Token(
        tokenTypes.TOKEN_TYPE_ROUND_BRACKET, bracket
    ));
    sourceCodeWalker.forward();
}

function lexNumber(sourceCodeWalker, token_stream) {
    let num = '';
    while (DIGITS.includes(sourceCodeWalker.currentElement) &&
        (!sourceCodeWalker.reached_end())) {
        num += sourceCodeWalker.currentElement;
        sourceCodeWalker.forward();
    }
    token_stream.push(new Token(
        tokenTypes.TOKEN_TYPE_NUMBER, parseInt(num)
    ));
}

function lexSemicolon(sourceCodeWalker, token_stream) {
    token_stream.push(new Token(
        tokenTypes.TOKEN_TYPE_SEMICOLON, ';'
    ));
    sourceCodeWalker.forward();
}

function lexString(sourceCodeWalker, token_stream) {
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
    token_stream.push(new Token(
        tokenTypes.TOKEN_TYPE_STRING, string
    ));
}

function lexOperator(sourceCodeWalker, token_stream) {
    token_stream.push(
        new Token(
            tokenTypes.TOKEN_TYPE_OPERATOR,
            sourceCodeWalker.currentElement
        )
    );
    sourceCodeWalker.forward();
}

function lexNameOrKeyword(sourceCodeWalker, token_stream) {
    let name_name = '';
    while (
        NAME_ALL_PERMITTED_CHARS.includes(
            sourceCodeWalker.currentElement
        ) && (!sourceCodeWalker.reached_end())
    ) {
        name_name += sourceCodeWalker.currentElement;
        sourceCodeWalker.forward();
    }

    if (KEYWORDS.includes(name_name)) {
        token_stream.push(new Token(
            tokenTypes.TOKEN_TYPE_KEYWORD, name_name
        ));
        return;
    }
    token_stream.push(new Token(
        tokenTypes.TOKEN_TYPE_NAME, name_name
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
