const lex = require('../lexer.js');
const tokenTypes = require('../token_types.js');
const Token = require('../token_class.js');

describe('Lexer Tests', () => {
    it('Should lex numbers correctly', () => {
        const tokens = lex('123 45 6');
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 123),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 45),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 6),
        ]);
    });

    it('Should lex operators correctly', () => {
        const tokens = lex('+ - * / > <');
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, '+'),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, '-'),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, '*'),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, '/'),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, '>'),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, '<'),
        ]);
    });

    it('Should lex round brackets correctly', () => {
        const tokens = lex('( )');
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, '('),
            new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, ')'),
        ]);
    });

    it('Should lex semicolons correctly', () => {
        const tokens = lex(';');
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_SEMICOLON, ';'),
        ]);
    });

    it('Should lex strings correctly', () => {
        const tokens = lex('"hello" "world"');
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_STRING, 'hello'),
            new Token(tokenTypes.TOKEN_TYPE_STRING, 'world'),
        ]);
    });

    it('Should lex names and keywords correctly', () => {
        const tokens = lex('print myVariable _var1');
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_KEYWORD, 'print'),
            new Token(tokenTypes.TOKEN_TYPE_NAME, 'myVariable'),
            new Token(tokenTypes.TOKEN_TYPE_NAME, '_var1'),
        ]);
    });

    it('Should lex mixed input correctly', () => {
        const tokens = lex('print(123 + "hello");');
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_KEYWORD, 'print'),
            new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, '('),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 123),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, '+'),
            new Token(tokenTypes.TOKEN_TYPE_STRING, 'hello'),
            new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, ')'),
            new Token(tokenTypes.TOKEN_TYPE_SEMICOLON, ';'),
        ]);
    });

    it('Should throw an error for invalid characters', () => {
        expect(() => {lex('@');}).toThrow(Error);
    });

    it('Should handle various whitespace combinations', () => {
        const tokens = lex('  print \t ( \n 123  + "hello" \r ) ;  ');
        expect(tokens).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_KEYWORD, 'print'),
            new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, '('),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 123),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, '+'),
            new Token(tokenTypes.TOKEN_TYPE_STRING, 'hello'),
            new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, ')'),
            new Token(tokenTypes.TOKEN_TYPE_SEMICOLON, ';'),
        ]);

        const tokens2 = lex('123\t\n\r  45  \t 6');
        expect(tokens2).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 123),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 45),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 6),
        ]);

        const tokens3 = lex('   "testString" \t\n\r  ');
        expect(tokens3).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_STRING, 'testString'),
        ]);
    });

    it('Should handle edge case of empty string', () => {
        const tokens = lex('');
        expect(tokens).toEqual([]);
    });

    it('Should handle edge case of only whitespace', () => {
        const tokens = lex(' \t\n\r ');
        expect(tokens).toEqual([]);
    })
});
