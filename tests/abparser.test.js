const { parse } = require('../abparser/abparser.js');
const { Node, Operation } = require('../abparser/node_classes.js');
const {
    TOKEN_TYPE_ROUND_BRACKET,
    TOKEN_TYPE_NUMBER,
    TOKEN_TYPE_SEMICOLON,
    TOKEN_TYPE_STRING,
    TOKEN_TYPE_OPERATOR,
    TOKEN_TYPE_KEYWORD,
    TOKEN_TYPE_NAME,
} = require('../token_types.js');
const operatorTypes = require('../abparser/operator_types.js');
const {
    NODE_TYPE_PRINT_STATEMENT,
    NODE_TYPE_NUMBER,
    NODE_TYPE_STRING,
    NODE_TYPE_EXPRESSION,
} = require('../abparser/ast_node_types.js');

describe('Parser Tests', () => {
    it('Should parse numbers correctly', () => {
        const tokens = [{ type: TOKEN_TYPE_NUMBER, value: 123 }];
        const ast = parse(tokens);
        expect(ast).toEqual([new Node(NODE_TYPE_NUMBER, 123)]);
    });

    it('Should parse strings correctly', () => {
        const tokens = [{ type: TOKEN_TYPE_STRING, value: 'hello' }];
        const ast = parse(tokens);
        expect(ast).toEqual([new Node(NODE_TYPE_STRING, 'hello')]);
    });

    it('Should parse print statements correctly', () => {
        const tokens = [
            { type: TOKEN_TYPE_KEYWORD, value: 'print' },
            { type: TOKEN_TYPE_ROUND_BRACKET, value: '(' },
            { type: TOKEN_TYPE_NUMBER, value: 123 },
            { type: TOKEN_TYPE_ROUND_BRACKET, value: ')' },
            { type: TOKEN_TYPE_SEMICOLON, value: ';' },
        ];

        const ast = parse(tokens);

        let expectedAST = [new Node(
            NODE_TYPE_PRINT_STATEMENT,
            new Node(
                NODE_TYPE_EXPRESSION,
                [new Operation(
                    [new Operation(123, 10, null)],
                    10,
                    null
                )]
            )
        )];

        expect(ast).toEqual(expectedAST);
    });

    it('Should parse simple expressions correctly', () => {
        const tokens = [
            { type: TOKEN_TYPE_ROUND_BRACKET, value: '(' },
            { type: TOKEN_TYPE_NUMBER, value: 1 },
            { type: TOKEN_TYPE_OPERATOR, value: '+' },
            { type: TOKEN_TYPE_NUMBER, value: 2 },
            { type: TOKEN_TYPE_ROUND_BRACKET, value: ')' },
        ];
        const ast = parse(tokens);
        expect(ast).toEqual([
            new Node(NODE_TYPE_EXPRESSION, [
                new Operation(1, operatorTypes.ADDITION, 2),
            ]),
        ]);
    });

    it('Should parse complex expressions with operator precedence', () => {
        const tokens = [
            { type: TOKEN_TYPE_ROUND_BRACKET, value: '(' },
            { type: TOKEN_TYPE_NUMBER, value: 1 },
            { type: TOKEN_TYPE_OPERATOR, value: '+' },
            { type: TOKEN_TYPE_NUMBER, value: 2 },
            { type: TOKEN_TYPE_OPERATOR, value: '*' },
            { type: TOKEN_TYPE_NUMBER, value: 3 },
            { type: TOKEN_TYPE_ROUND_BRACKET, value: ')' },
        ];
        const ast = parse(tokens);
        expect(ast).toEqual([
            new Node(NODE_TYPE_EXPRESSION, [
                new Operation(1, operatorTypes.ADDITION, [new Operation(2, operatorTypes.MULTIPLICATION, 3)]),
            ]),
        ]);
    });

    it('Should handle nested expressions correctly', () => {
        const tokens = [
            { type: TOKEN_TYPE_ROUND_BRACKET, value: '(' },
            { type: TOKEN_TYPE_NUMBER, value: 1 },
            { type: TOKEN_TYPE_OPERATOR, value: '+' },
            { type: TOKEN_TYPE_ROUND_BRACKET, value: '(' },
            { type: TOKEN_TYPE_NUMBER, value: 2 },
            { type: TOKEN_TYPE_OPERATOR, value: '*' },
            { type: TOKEN_TYPE_NUMBER, value: 3 },
            { type: TOKEN_TYPE_ROUND_BRACKET, value: ')' },
            { type: TOKEN_TYPE_ROUND_BRACKET, value: ')' },
        ];
        const ast = parse(tokens);
        expect(ast).toEqual([
            new Node(NODE_TYPE_EXPRESSION, [
                new Operation(1, operatorTypes.ADDITION, [new Operation(2, operatorTypes.MULTIPLICATION, 3)]),
            ]),
        ]);
    });

    it('Should throw a syntax error for unmatched closing bracket', () => {
        const tokens = [
            { type: TOKEN_TYPE_ROUND_BRACKET, value: ')' },
        ];
        expect(() => parse(tokens)).toThrow('Syntax error: Bracket error.');
    });

    it('Should throw an error for a semicolon outside a statement', () => {
        const tokens = [{ type: TOKEN_TYPE_SEMICOLON, value: ';' }];
        expect(() => parse(tokens)).toThrow('Syntax error: There is a semicolon that is not part of a statement.');
    });

    it('Should throw error for an unsupported name', () => {
        const tokens = [{ type: TOKEN_TYPE_NAME, value: 'variable' }];
        expect(() => parse(tokens)).toThrow('Unsupported: Names are not supported yet.');
    });

    it('Should throw an error for invalid token', () => {
        const tokens = [{ type: 'INVALID', value: 'invalid' }];
        expect(() => parse(tokens)).toThrow('Report this bug: Parser recieved an invalid token from the lexer.');
    });

    it('Should parse addition and subtraction correctly', () => {
        const tokens = [
            { type: TOKEN_TYPE_ROUND_BRACKET, value: '(' },
            { type: TOKEN_TYPE_NUMBER, value: 1 },
            { type: TOKEN_TYPE_OPERATOR, value: '+' },
            { type: TOKEN_TYPE_NUMBER, value: 2 },
            { type: TOKEN_TYPE_OPERATOR, value: '-' },
            { type: TOKEN_TYPE_NUMBER, value: 3 },
            { type: TOKEN_TYPE_ROUND_BRACKET, value: ')' },
        ];
        const ast = parse(tokens);
        expect(ast).toEqual([
            new Node(NODE_TYPE_EXPRESSION, [
                new Operation([new Operation(1, operatorTypes.ADDITION, 2)], operatorTypes.SUBTRACTION, 3),
            ]),
        ]);
    });

    it('Should parse multiple additions correctly', () => {
        const tokens = [
            { type: TOKEN_TYPE_ROUND_BRACKET, value: '(' },
            { type: TOKEN_TYPE_NUMBER, value: 1 },
            { type: TOKEN_TYPE_OPERATOR, value: '+' },
            { type: TOKEN_TYPE_NUMBER, value: 2 },
            { type: TOKEN_TYPE_OPERATOR, value: '+' },
            { type: TOKEN_TYPE_NUMBER, value: 3 },
            { type: TOKEN_TYPE_ROUND_BRACKET, value: ')' },
        ];
        const ast = parse(tokens);
        expect(ast).toEqual([
            new Node(NODE_TYPE_EXPRESSION, [
                new Operation([new Operation(1, operatorTypes.ADDITION, 2)], operatorTypes.ADDITION, 3),
            ]),
        ]);
    });

    it('Should parse multiple subtractions correctly', () => {
        const tokens = [
            { type: TOKEN_TYPE_ROUND_BRACKET, value: '(' },
            { type: TOKEN_TYPE_NUMBER, value: 10 },
            { type: TOKEN_TYPE_OPERATOR, value: '-' },
            { type: TOKEN_TYPE_NUMBER, value: 5 },
            { type: TOKEN_TYPE_OPERATOR, value: '-' },
            { type: TOKEN_TYPE_NUMBER, value: 2 },
            { type: TOKEN_TYPE_ROUND_BRACKET, value: ')' },
        ];
        const ast = parse(tokens);
        expect(ast).toEqual([
            new Node(NODE_TYPE_EXPRESSION, [
                new Operation([new Operation(10, operatorTypes.SUBTRACTION, 5)], operatorTypes.SUBTRACTION, 2),
            ]),
        ]);
    });
});
