import { parse } from "../src/abparser/abparser";
import {
    Node,
    Operation,
    AssignmentStatement,
} from "../src/abparser/node_classes";
import {
    NODE_TYPE_EXPRESSION,
    NODE_TYPE_ASSIGNMENT_STATEMENT,
} from "../src/abparser/ast_node_types";
import * as operatorTypes from "../src/abparser/operator_types";
import lex from "../src/lexer";
import { Token } from "../src/token_class";
import * as tokenTypes from "../src/token_types";

describe("Let statement: lexer", () => {
    it("Should lex a let statement", () => {
        expect(lex("let i = 5")).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_KEYWORD, "let"),
            new Token(tokenTypes.TOKEN_TYPE_NAME, "i"),
            new Token(tokenTypes.TOKEN_TYPE_ASSIGNMENT, "="),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 5),
        ]);
    });

    it("Should still lex == as an operator", () => {
        expect(lex("1 == 1")).toEqual([
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 1),
            new Token(tokenTypes.TOKEN_TYPE_OPERATOR, "=="),
            new Token(tokenTypes.TOKEN_TYPE_NUMBER, 1),
        ]);
    });
});

describe("Let statement: parser", () => {
    it("Should parse a simple assignment", () => {
        const ast = parse(lex("let i = 5"));
        expect(ast).toEqual([
            new Node(
                NODE_TYPE_ASSIGNMENT_STATEMENT,
                new AssignmentStatement(
                    "i",
                    new Node(NODE_TYPE_EXPRESSION, [
                        new Operation(5, operatorTypes.LEAVE_AS_IS, null),
                    ])
                )
            ),
        ]);
    });

    it("Should parse an assignment with a bracketless expression", () => {
        const ast = parse(lex("let total = 1 + 2"));
        expect(ast).toEqual([
            new Node(
                NODE_TYPE_ASSIGNMENT_STATEMENT,
                new AssignmentStatement(
                    "total",
                    new Node(NODE_TYPE_EXPRESSION, [
                        new Operation(1, operatorTypes.ADDITION, 2),
                    ])
                )
            ),
        ]);
    });

    it("Should parse consecutive assignments", () => {
        const ast = parse(lex("let a = 1\nlet b = 2\n"));
        expect(ast.length).toBe(2);
        expect(ast[0].value.name).toBe("a");
        expect(ast[1].value.name).toBe("b");
        expect(ast[1].type).toBe(NODE_TYPE_ASSIGNMENT_STATEMENT);
    });

    it("Should parse an assignment inside an if block", () => {
        const ast = parse(lex("if 1 == 1:\n    let x = 3\n"));
        const body = ast[0].value.body;
        expect(body.length).toBe(1);
        expect(body[0].type).toBe(NODE_TYPE_ASSIGNMENT_STATEMENT);
        expect(body[0].value.name).toBe("x");
    });

    it("Should throw a syntax error if the name is missing", () => {
        expect(() => parse(lex("let = 5"))).toThrow(/Syntax error/);
        expect(() => parse(lex("let 5"))).toThrow(/Syntax error/);
    });

    it("Should throw a syntax error if the assignment token is missing", () => {
        expect(() => parse(lex("let i 5"))).toThrow(/Syntax error/);
        expect(() => parse(lex("let i"))).toThrow(/Syntax error/);
    });

    it("Should throw a syntax error if the expression is missing", () => {
        expect(() => parse(lex("let i ="))).toThrow(/Syntax error/);
        expect(() => parse(lex("let i =\n"))).toThrow(/Syntax error/);
    });

    it("Should throw a syntax error if the value is not an expression", () => {
        expect(() => parse(lex("let i = print 5"))).toThrow(/Syntax error/);
    });
});
