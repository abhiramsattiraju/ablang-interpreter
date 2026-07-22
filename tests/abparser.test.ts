import { parse } from "../src/abparser/abparser";
import { Node, Operation } from "../src/abparser/node_classes";
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
});
