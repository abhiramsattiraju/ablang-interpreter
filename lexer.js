let StreamWalker = require('./stream_walker.js');
const token_types = require('./token_types.js');
const exceptions = require('./exceptions.js');


const DIGITS = '1234567890';
const OPERATORS = '+-*/';
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
    while(!source_code_walker.reached_end()) {
        // Opening bracket.
        if(source_code_walker.current_element === '(') {
            token_stream.push(new Token(
                token_types.TOKEN_TYPE_ROUND_BRACKET, '('
            ));
            source_code_walker.forward();
        }

        // Closing bracket.
        else if(source_code_walker.current_element === ')') {
            token_stream.push(new Token(
                token_types.TOKEN_TYPE_ROUND_BRACKET, ')'
            ));
            source_code_walker.forward();
        }

        // Number.
        else if(DIGITS.includes(source_code_walker.current_element)) {
            let num = '';
            while(DIGITS.includes(source_code_walker.current_element) &&
                  (!source_code_walker.reached_end())) {
                num += source_code_walker.current_element;
                source_code_walker.forward();
            }
            token_stream.push(new Token(
                token_types.TOKEN_TYPE_NUMBER, parseInt(num)
            ));
        }

        // Semicolon.
        else if(source_code_walker.current_element === ';') {
            token_stream.push(new Token(
                token_types.TOKEN_TYPE_SEMICOLON, ';'
            ));
            source_code_walker.forward();
        }

        // String.
        else if(source_code_walker.current_element === '"') {
            let string = '';
            source_code_walker.forward();
            while(source_code_walker.current_element !== '"') {
                if(source_code_walker.reached_end()) {
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

        // Operator.
        else if(OPERATORS.includes(source_code_walker.current_element)) {
            token_stream.push(
                new Token(
                    token_types.TOKEN_TYPE_OPERATOR,
                    source_code_walker.current_element
                )
            );
            source_code_walker.forward();
        }

        // Name/Keyword.
        else if(NAME_PERMITTED_FIRST_CHARS.includes(
            source_code_walker.current_element
        )) {
            let name_name = '';
            while(
                NAME_ALL_PERMITTED_CHARS.includes(
                    source_code_walker.current_element
                ) && (!source_code_walker.reached_end())
            ) {
                name_name += source_code_walker.current_element;
                source_code_walker.forward();
            }

            if(KEYWORDS.includes(name_name)) {
                token_stream.push(new Token(
                    token_types.TOKEN_TYPE_KEYWORD, name_name
                ));
                continue;
            }
            token_stream.push(new Token(
                token_types.TOKEN_TYPE_NAME, name_name
            ));
        }

        // Whitespace.
        else if(WHITESPACES.includes(source_code_walker.current_element)) {
            source_code_walker.forward();
        }

        // Invalid character.
        else {
            exceptions.raiseException(exceptions.SYNTAX_ERROR,
                `Invalid character "${source_code_walker.current_element}"`);
        }
    }

    return token_stream;
}


module.exports = lex;
