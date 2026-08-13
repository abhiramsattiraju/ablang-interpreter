import { parse } from "../src/abparser/abparser";
import { Node, Operation, IfStatement } from "../src/abparser/node_classes";
import lex from "../src/lexer";
import {
    TOKEN_TYPE_ROUND_BRACKET,
    TOKEN_TYPE_NUMBER,
    TOKEN_TYPE_STRING,
    TOKEN_TYPE_OPERATOR,
    TOKEN_TYPE_NAME,
} from "../src/token_types";
import * as operatorTypes from "../src/abparser/operator_types";
import {
    NODE_TYPE_NUMBER as AST_NODE_TYPE_NUMBER,
    NODE_TYPE_STRING as AST_NODE_TYPE_STRING,
    NODE_TYPE_EXPRESSION,
    NODE_TYPE_PRINT_STATEMENT,
    NODE_TYPE_IF_STATEMENT,
} from "../src/abparser/ast_node_types";

// In the original JS test, TOKEN_TYPE_SEMICOLON was imported from token_types but was undefined.
const TOKEN_TYPE_SEMICOLON = undefined as any;

describe("Parser Tests", () => {
    it("Should parse numbers correctly", () => {
        const tokens = [{ type: TOKEN_TYPE_NUMBER, value: 123 }];
        const ast = parse(tokens);
        expect(ast).toEqual([new Node(AST_NODE_TYPE_NUMBER, 123)]);
    });

    it("Should parse strings correctly", () => {
        const tokens = [{ type: TOKEN_TYPE_STRING, value: "hello" }];
        const ast = parse(tokens);
        expect(ast).toEqual([new Node(AST_NODE_TYPE_STRING, "hello")]);
    });

    it("Should parse simple expressions correctly", () => {
        const tokens = [
            { type: TOKEN_TYPE_ROUND_BRACKET, value: "(" },
            { type: TOKEN_TYPE_NUMBER, value: 1 },
            { type: TOKEN_TYPE_OPERATOR, value: "+" },
            { type: TOKEN_TYPE_NUMBER, value: 2 },
            { type: TOKEN_TYPE_ROUND_BRACKET, value: ")" },
        ];
        const ast = parse(tokens);
        expect(ast).toEqual([
            new Node(NODE_TYPE_EXPRESSION, [
                new Operation(1, operatorTypes.ADDITION, 2),
            ]),
        ]);
    });

    it("Should parse complex expressions with operator precedence", () => {
        const tokens = [
            { type: TOKEN_TYPE_ROUND_BRACKET, value: "(" },
            { type: TOKEN_TYPE_NUMBER, value: 1 },
            { type: TOKEN_TYPE_OPERATOR, value: "+" },
            { type: TOKEN_TYPE_NUMBER, value: 2 },
            { type: TOKEN_TYPE_OPERATOR, value: "*" },
            { type: TOKEN_TYPE_NUMBER, value: 3 },
            { type: TOKEN_TYPE_ROUND_BRACKET, value: ")" },
        ];
        const ast = parse(tokens);
        expect(ast).toEqual([
            new Node(NODE_TYPE_EXPRESSION, [
                new Operation(1, operatorTypes.ADDITION, [
                    new Operation(2, operatorTypes.MULTIPLICATION, 3),
                ]),
            ]),
        ]);
    });

    it("Should handle nested expressions correctly", () => {
        const tokens = [
            { type: TOKEN_TYPE_ROUND_BRACKET, value: "(" },
            { type: TOKEN_TYPE_NUMBER, value: 1 },
            { type: TOKEN_TYPE_OPERATOR, value: "+" },
            { type: TOKEN_TYPE_ROUND_BRACKET, value: "(" },
            { type: TOKEN_TYPE_NUMBER, value: 2 },
            { type: TOKEN_TYPE_OPERATOR, value: "*" },
            { type: TOKEN_TYPE_NUMBER, value: 3 },
            { type: TOKEN_TYPE_ROUND_BRACKET, value: ")" },
            { type: TOKEN_TYPE_ROUND_BRACKET, value: ")" },
        ];
        const ast = parse(tokens);
        expect(ast).toEqual([
            new Node(NODE_TYPE_EXPRESSION, [
                new Operation(1, operatorTypes.ADDITION, [
                    new Operation(2, operatorTypes.MULTIPLICATION, 3),
                ]),
            ]),
        ]);
    });

    it("Should throw a syntax error for unmatched closing bracket", () => {
        const tokens = [{ type: TOKEN_TYPE_ROUND_BRACKET, value: ")" }];
        expect(() => parse(tokens)).toThrow(Error);
    });

    it("Should throw an error for a semicolon outside a statement", () => {
        const tokens = [{ type: TOKEN_TYPE_SEMICOLON, value: ";" }];
        expect(() => parse(tokens)).toThrow(Error);
    });

    it("Should throw error for an unsupported name", () => {
        const tokens = [{ type: TOKEN_TYPE_NAME, value: "variable" }];
        expect(() => parse(tokens)).toThrow(Error);
    });

    it("Should throw an error for invalid token", () => {
        const tokens = [{ type: "INVALID" as any, value: "invalid" }];
        expect(() => parse(tokens)).toThrow(Error);
    });

    it("Should parse addition and subtraction correctly", () => {
        const tokens = [
            { type: TOKEN_TYPE_ROUND_BRACKET, value: "(" },
            { type: TOKEN_TYPE_NUMBER, value: 1 },
            { type: TOKEN_TYPE_OPERATOR, value: "+" },
            { type: TOKEN_TYPE_NUMBER, value: 2 },
            { type: TOKEN_TYPE_OPERATOR, value: "-" },
            { type: TOKEN_TYPE_NUMBER, value: 3 },
            { type: TOKEN_TYPE_ROUND_BRACKET, value: ")" },
        ];
        const ast = parse(tokens);
        expect(ast).toEqual([
            new Node(NODE_TYPE_EXPRESSION, [
                new Operation(
                    [new Operation(1, operatorTypes.ADDITION, 2)],
                    operatorTypes.SUBTRACTION,
                    3
                ),
            ]),
        ]);
    });

    it("Should parse multiple additions correctly", () => {
        const tokens = [
            { type: TOKEN_TYPE_ROUND_BRACKET, value: "(" },
            { type: TOKEN_TYPE_NUMBER, value: 1 },
            { type: TOKEN_TYPE_OPERATOR, value: "+" },
            { type: TOKEN_TYPE_NUMBER, value: 2 },
            { type: TOKEN_TYPE_OPERATOR, value: "+" },
            { type: TOKEN_TYPE_NUMBER, value: 3 },
            { type: TOKEN_TYPE_ROUND_BRACKET, value: ")" },
        ];
        const ast = parse(tokens);
        expect(ast).toEqual([
            new Node(NODE_TYPE_EXPRESSION, [
                new Operation(
                    [new Operation(1, operatorTypes.ADDITION, 2)],
                    operatorTypes.ADDITION,
                    3
                ),
            ]),
        ]);
    });

    it("Should parse multiple subtractions correctly", () => {
        const tokens = [
            { type: TOKEN_TYPE_ROUND_BRACKET, value: "(" },
            { type: TOKEN_TYPE_NUMBER, value: 10 },
            { type: TOKEN_TYPE_OPERATOR, value: "-" },
            { type: TOKEN_TYPE_NUMBER, value: 5 },
            { type: TOKEN_TYPE_OPERATOR, value: "-" },
            { type: TOKEN_TYPE_NUMBER, value: 2 },
            { type: TOKEN_TYPE_ROUND_BRACKET, value: ")" },
        ];
        const ast = parse(tokens);
        expect(ast).toEqual([
            new Node(NODE_TYPE_EXPRESSION, [
                new Operation(
                    [new Operation(10, operatorTypes.SUBTRACTION, 5)],
                    operatorTypes.SUBTRACTION,
                    2
                ),
            ]),
        ]);
    });

    it("Should parse simple if-statements correctly", () => {
        const tokens = lex([
            'if 1 > 0:',
            '    print "Positive"',
        ].join('\n'));
        const ast = parse(tokens);

        const expectedCondition = new Node(NODE_TYPE_EXPRESSION, [
            new Operation(1, operatorTypes.GREATER_THAN, 0),
        ]);
        const expectedPrintBody = new Node(NODE_TYPE_PRINT_STATEMENT, new Node(NODE_TYPE_EXPRESSION, [
            new Operation("Positive", operatorTypes.LEAVE_AS_IS, null),
        ]));

        expect(ast).toEqual([
            new Node(NODE_TYPE_IF_STATEMENT, new IfStatement(expectedCondition, [expectedPrintBody])),
        ]);
    });

    it("Should parse single-line if-statements with then-block on the same line", () => {
        const tokens = lex('if 1 > 0: print "Single line"');
        const ast = parse(tokens);

        const expectedCondition = new Node(NODE_TYPE_EXPRESSION, [
            new Operation(1, operatorTypes.GREATER_THAN, 0),
        ]);
        const expectedPrintBody = new Node(NODE_TYPE_PRINT_STATEMENT, new Node(NODE_TYPE_EXPRESSION, [
            new Operation("Single line", operatorTypes.LEAVE_AS_IS, null),
        ]));

        expect(ast).toEqual([
            new Node(NODE_TYPE_IF_STATEMENT, new IfStatement(expectedCondition, [expectedPrintBody])),
        ]);
    });

    it("Should parse multi-line if-statements with multiple statements in then-block", () => {
        const tokens = lex([
            'if 1 > 0:',
            '    print "First"',
            '    print "Second"',
        ].join('\n'));
        const ast = parse(tokens);

        const expectedCondition = new Node(NODE_TYPE_EXPRESSION, [
            new Operation(1, operatorTypes.GREATER_THAN, 0),
        ]);
        const printBody1 = new Node(NODE_TYPE_PRINT_STATEMENT, new Node(NODE_TYPE_EXPRESSION, [
            new Operation("First", operatorTypes.LEAVE_AS_IS, null),
        ]));
        const printBody2 = new Node(NODE_TYPE_PRINT_STATEMENT, new Node(NODE_TYPE_EXPRESSION, [
            new Operation("Second", operatorTypes.LEAVE_AS_IS, null),
        ]));

        expect(ast).toEqual([
            new Node(NODE_TYPE_IF_STATEMENT, new IfStatement(expectedCondition, [printBody1, printBody2])),
        ]);
    });

    it("Should throw a syntax error when colon is missing in if statement", () => {
        const tokens = lex([
            'if 1 > 0',
            '    print "Missing colon"',
        ].join('\n'));
        expect(() => parse(tokens)).toThrow(Error);
    });

    it("Should throw a syntax error for empty condition in if statement", () => {
        const tokens = lex('if: print "No condition"');
        expect(() => parse(tokens)).toThrow(Error);
    });

    it("Should throw a syntax error for empty if statement / no then-block", () => {
        const tokens = lex("if 1 > 0:");
        expect(() => parse(tokens)).toThrow(Error);
    });

    it("Should throw a syntax error for if statement followed by newline with no then-block", () => {
        const tokens = lex("if 1 > 0:\n");
        expect(() => parse(tokens)).toThrow(Error);
    });

    it("Should throw a syntax error for if keyword at EOF", () => {
        const tokens = lex("if");
        expect(() => parse(tokens)).toThrow(Error);
    });

    it("Should throw a syntax error when there is a token that is not an \
expression after the if token.", () => {
        let tokens = lex('if print "hello":\n    print "world"');
        expect(() => parse(tokens)).toThrow(Error);

        tokens = lex('if if:\n    print "world"');
        expect(() => parse(tokens)).toThrow(Error);
    });
});

describe("Indented block tests", () => {
    const indentStyles = [
        { name: "4 spaces", indent: "    " },
        { name: "2 spaces", indent: "  " },
        { name: "8 spaces", indent: "        " },
        { name: "1 space", indent: " " },
        { name: "1 tab", indent: "\t" },
        { name: "2 tabs", indent: "\t\t" },
    ];

    indentStyles.forEach(({ name, indent }) => {
        it(`Should parse a basic indented if-block with ${name}`, () => {
            const tokens = lex([
                'if 1 > 0:',
                `${indent}print "Yes"`,
            ].join('\n'));
            const ast = parse(tokens);

            const expectedCondition = new Node(NODE_TYPE_EXPRESSION, [
                new Operation(1, operatorTypes.GREATER_THAN, 0),
            ]);
            const expectedBody = new Node(NODE_TYPE_PRINT_STATEMENT, new Node(NODE_TYPE_EXPRESSION, [
                new Operation("Yes", operatorTypes.LEAVE_AS_IS, null),
            ]));

            expect(ast).toEqual([
                new Node(NODE_TYPE_IF_STATEMENT, new IfStatement(expectedCondition, [expectedBody])),
            ]);
        });
    });

    it("Should parse multiple independent indented if-blocks", () => {
        const tokens = lex([
            'if 1 > 0:',
            '    print "A"',
            'if 2 > 1:',
            '    print "B"',
        ].join('\n'));
        const ast = parse(tokens);

        const condition1 = new Node(NODE_TYPE_EXPRESSION, [
            new Operation(1, operatorTypes.GREATER_THAN, 0),
        ]);
        const body1 = new Node(NODE_TYPE_PRINT_STATEMENT, new Node(NODE_TYPE_EXPRESSION, [
            new Operation("A", operatorTypes.LEAVE_AS_IS, null),
        ]));

        const condition2 = new Node(NODE_TYPE_EXPRESSION, [
            new Operation(2, operatorTypes.GREATER_THAN, 1),
        ]);
        const body2 = new Node(NODE_TYPE_PRINT_STATEMENT, new Node(NODE_TYPE_EXPRESSION, [
            new Operation("B", operatorTypes.LEAVE_AS_IS, null),
        ]));

        expect(ast).toEqual([
            new Node(NODE_TYPE_IF_STATEMENT, new IfStatement(condition1, [body1])),
            new Node(NODE_TYPE_IF_STATEMENT, new IfStatement(condition2, [body2])),
        ]);
    });

    it("Should parse nested if-statements (if inside if)", () => {
        const tokens = lex([
            'if 1 > 0:',
            '    if 2 > 1:',
            '        print "Nested"',
        ].join('\n'));
        const ast = parse(tokens);

        const innerCondition = new Node(NODE_TYPE_EXPRESSION, [
            new Operation(2, operatorTypes.GREATER_THAN, 1),
        ]);
        const innerBody = new Node(NODE_TYPE_PRINT_STATEMENT, new Node(NODE_TYPE_EXPRESSION, [
            new Operation("Nested", operatorTypes.LEAVE_AS_IS, null),
        ]));
        const innerIf = new Node(NODE_TYPE_IF_STATEMENT, new IfStatement(innerCondition, [innerBody]));

        const outerCondition = new Node(NODE_TYPE_EXPRESSION, [
            new Operation(1, operatorTypes.GREATER_THAN, 0),
        ]);

        expect(ast).toEqual([
            new Node(NODE_TYPE_IF_STATEMENT, new IfStatement(outerCondition, [innerIf])),
        ]);
    });

    it("Should parse a nested if followed by a sibling statement in the outer block", () => {
        const tokens = lex([
            'if 1 > 0:',
            '    if 2 > 0:',
            '        print "hi"',
            '    print "hi"',
        ].join('\n'));
        const ast = parse(tokens);

        const hiExpr = new Node(NODE_TYPE_EXPRESSION, [
            new Operation("hi", operatorTypes.LEAVE_AS_IS, null),
        ]);

        const innerCondition = new Node(NODE_TYPE_EXPRESSION, [
            new Operation(2, operatorTypes.GREATER_THAN, 0),
        ]);
        const innerIf = new Node(NODE_TYPE_IF_STATEMENT, new IfStatement(
            innerCondition,
            [new Node(NODE_TYPE_PRINT_STATEMENT, hiExpr)]
        ));

        const siblingPrint = new Node(NODE_TYPE_PRINT_STATEMENT, hiExpr);

        const outerCondition = new Node(NODE_TYPE_EXPRESSION, [
            new Operation(1, operatorTypes.GREATER_THAN, 0),
        ]);

        expect(ast).toEqual([
            new Node(NODE_TYPE_IF_STATEMENT, new IfStatement(outerCondition, [innerIf, siblingPrint])),
        ]);
    });

    it("Should parse a nested if-only block (if 1 > 0 contains if 2 > 0)", () => {
        const tokens = lex([
            'if 1 > 0:',
            '    if 2 > 0:',
            '        print "hi"',
        ].join('\n'));
        const ast = parse(tokens);

        const hiExpr = new Node(NODE_TYPE_EXPRESSION, [
            new Operation("hi", operatorTypes.LEAVE_AS_IS, null),
        ]);

        const innerCondition = new Node(NODE_TYPE_EXPRESSION, [
            new Operation(2, operatorTypes.GREATER_THAN, 0),
        ]);
        const innerIf = new Node(NODE_TYPE_IF_STATEMENT, new IfStatement(
            innerCondition,
            [new Node(NODE_TYPE_PRINT_STATEMENT, hiExpr)]
        ));

        const outerCondition = new Node(NODE_TYPE_EXPRESSION, [
            new Operation(1, operatorTypes.GREATER_THAN, 0),
        ]);

        expect(ast).toEqual([
            new Node(NODE_TYPE_IF_STATEMENT, new IfStatement(outerCondition, [innerIf])),
        ]);
    });

    it("Should parse a program with two top-level if-statements, the first having a nested if and a sibling print", () => {
        const program = [
            'if 1 > 0:',
            '    if 2 > 0:',
            '        print "hi"',
            '    print "hi"',
            '',
            'if 1 > 0:',
            '    if 2 > 0:',
            '        print "hi"',
        ].join('\n');
        const ast = parse(lex(program));

        const hiExpr = new Node(NODE_TYPE_EXPRESSION, [
            new Operation("hi", operatorTypes.LEAVE_AS_IS, null),
        ]);
        const printHi = new Node(NODE_TYPE_PRINT_STATEMENT, hiExpr);

        const innerCond = new Node(NODE_TYPE_EXPRESSION, [
            new Operation(2, operatorTypes.GREATER_THAN, 0),
        ]);
        const innerIf = new Node(NODE_TYPE_IF_STATEMENT, new IfStatement(innerCond, [printHi]));

        const outerCond = new Node(NODE_TYPE_EXPRESSION, [
            new Operation(1, operatorTypes.GREATER_THAN, 0),
        ]);

        expect(ast).toEqual([
            // First top-level if: body = [innerIf, sibling print]
            new Node(NODE_TYPE_IF_STATEMENT, new IfStatement(outerCond, [innerIf, printHi])),
            // Second top-level if: body = [innerIf only]
            new Node(NODE_TYPE_IF_STATEMENT, new IfStatement(outerCond, [innerIf])),
        ]);
    });
});
