const {
    TOKEN_TYPE_ROUND_BRACKET,
    TOKEN_TYPE_NUMBER,
    TOKEN_TYPE_SEMICOLON,
    TOKEN_TYPE_STRING,
    TOKEN_TYPE_OPERATOR,
    TOKEN_TYPE_KEYWORD,
    TOKEN_TYPE_NAME,
} = require('./token_types.js');
const {
    NODE_TYPE_PRINT_STATEMENT,
    NODE_TYPE_NUMBER,
    NODE_TYPE_STRING,
    NODE_TYPE_EXPRESSION,
} = require('./abparser/ast_node_types.js');
const { parse } = require('./abparser/abparser.js');
const { Node, Operation } = require('./abparser/node_classes.js');

const tokens = [
    { type: TOKEN_TYPE_KEYWORD, value: 'print' },
    { type: TOKEN_TYPE_ROUND_BRACKET, value: '(' },
    { type: TOKEN_TYPE_NUMBER, value: 123 },
    { type: TOKEN_TYPE_ROUND_BRACKET, value: ')' },
    { type: TOKEN_TYPE_SEMICOLON, value: ';' },
];

let recvd = parse(tokens);

let expected = [new Node(
    NODE_TYPE_PRINT_STATEMENT,
    new Node(
        NODE_TYPE_EXPRESSION,
        [new Operation(
            [new Operation(123, 10, null)],
            10,
            null
        )]
    )
)]

console.log(recvd[0].value.value);
console.log(expected[0].value.value);
console.log(JSON.stringify(recvd) === JSON.stringify(expected));
