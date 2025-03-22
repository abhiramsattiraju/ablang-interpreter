let StreamWalker = require('./stream_walker.js');
const token_types = require('./token_types.js');
const exceptions = require('./exceptions.js');

const DIGITS = '1234567890';
const OPERATORS = ['+', '-', '*', '/', '>', '<', '>=', '<=', '==', '!='];
const NAME_PERMITTED_FIRST_CHARS =
    '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NAME_ALL_PERMITTED_CHARS =
    '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const WHITESPACES = ' \t\n\r';
const KEYWORDS = ['print'];

class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

// Takes ABLang source code in a string and returns a token stream or a list of
// tokens.
function lex(source_code) {
    let source_code_walker = new StreamWalker(source_code);
    let token_stream = [];

    // Loop through the source code.
    while (!source_code_walker.reached_end()) {
        if (source_code_walker.current_element === '(') {
            lexRoundBracket(source_code_walker, token_stream, '(');
        } else if (source_code_walker.current_element === ')') {
            lexRoundBracket(source_code_walker, token_stream, ')');
        } else if (DIGITS.includes(source_code_walker.current_element)) {
            lexNumber(source_code_walker, token_stream);
        } else if (source_code_walker.current_element === ';') {
            lexSemicolon(source_code_walker, token_stream);
        } else if (source_code_walker.current_element === '"') {
            lexString(source_code_walker, token_stream);
        } else if (isStartOfOperator(source_code_walker.current_element)) {
            lexOperator(source_code_walker, token_stream);
        } else if (NAME_PERMITTED_FIRST_CHARS.includes(
            source_code_walker.current_element
        )) {
            lexNameOrKeyword(source_code_walker, token_stream);
        } else if (WHITESPACES.includes(source_code_walker.current_element)) {
            source_code_walker.forward();
        } else {
            exceptions.raiseException(exceptions.SYNTAX_ERROR,
                `Invalid character "${source_code_walker.current_element}"`);
        }
    }

    return token_stream;
}

function lexRoundBracket(source_code_walker, token_stream, bracket) {
    token_stream.push(new Token(
        token_types.TOKEN_TYPE_ROUND_BRACKET, bracket
    ));
    source_code_walker.forward();
}

function lexNumber(source_code_walker, token_stream) {
    let num = '';
    while (DIGITS.includes(source_code_walker.current_element) &&
        (!source_code_walker.reached_end())) {
        num += source_code_walker.current_element;
        source_code_walker.forward();
    }
    token_stream.push(new Token(
        token_types.TOKEN_TYPE_NUMBER, parseInt(num)
    ));
}

function lexSemicolon(source_code_walker, token_stream) {
    token_stream.push(new Token(
        token_types.TOKEN_TYPE_SEMICOLON, ';'
    ));
    source_code_walker.forward();
}

function lexString(source_code_walker, token_stream) {
    let string = '';
    source_code_walker.forward();
    while (source_code_walker.current_element !== '"') {
        if (source_code_walker.reached_end()) {
            exceptions.raiseException(exceptions.SYNTAX_ERROR,
                'Unterminated string.');
        }

        string += source_code_walker.current_element;
        source_code_walker.forward();
    }
    source_code_walker.forward();
    token_stream.push(new Token(
        token_types.TOKEN_TYPE_STRING, string
    ));
}

function lexOperator(source_code_walker, token_stream) {
    token_stream.push(
        new Token(
            token_types.TOKEN_TYPE_OPERATOR,
            source_code_walker.current_element
        )
    );
    source_code_walker.forward();
}

function lexNameOrKeyword(source_code_walker, token_stream) {
    let name_name = '';
    while (
        NAME_ALL_PERMITTED_CHARS.includes(
            source_code_walker.current_element
        ) && (!source_code_walker.reached_end())
    ) {
        name_name += source_code_walker.current_element;
        source_code_walker.forward();
    }

    if (KEYWORDS.includes(name_name)) {
        token_stream.push(new Token(
            token_types.TOKEN_TYPE_KEYWORD, name_name
        ));
        return;
    }
    token_stream.push(new Token(
        token_types.TOKEN_TYPE_NAME, name_name
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
