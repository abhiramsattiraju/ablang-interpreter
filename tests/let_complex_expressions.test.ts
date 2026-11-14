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

describe("Let statement: complex expressions", () => {
    const letNode = (name: string, operations: Operation[]) =>
        new Node(
            NODE_TYPE_ASSIGNMENT_STATEMENT,
            new AssignmentStatement(name, new Node(NODE_TYPE_EXPRESSION, operations))
        );

    it("Should handle multiplication before addition", () => {
        expect(parse(lex("let x = 1 + 2 * 3"))).toEqual([
            letNode("x", [
                new Operation(1, operatorTypes.ADDITION, [
                    new Operation(2, operatorTypes.MULTIPLICATION, 3),
                ]),
            ]),
        ]);
    });

    it("Should evaluate same-precedence operators left to right", () => {
        expect(parse(lex("let x = 1 + 2 - 3"))).toEqual([
            letNode("x", [
                new Operation(
                    [new Operation(1, operatorTypes.ADDITION, 2)],
                    operatorTypes.SUBTRACTION,
                    3
                ),
            ]),
        ]);
    });

    it("Should handle division before subtraction", () => {
        expect(parse(lex("let x = 10 - 8 / 2"))).toEqual([
            letNode("x", [
                new Operation(10, operatorTypes.SUBTRACTION, [
                    new Operation(8, operatorTypes.DIVISION, 2),
                ]),
            ]),
        ]);
    });

    it("Should handle bracketed sub-expressions", () => {
        expect(parse(lex("let x = (1 + 2) * 3"))).toEqual([
            letNode("x", [
                new Operation(
                    [new Operation(1, operatorTypes.ADDITION, 2)],
                    operatorTypes.MULTIPLICATION,
                    3
                ),
            ]),
        ]);
    });

    it("Should handle an expression wrapped entirely in brackets", () => {
        const ast = parse(lex("let x = (1 + 2)"));
        expect(ast.length).toBe(1);
        expect(ast[0].type).toBe(NODE_TYPE_ASSIGNMENT_STATEMENT);
        expect(ast[0].value.name).toBe("x");
    });

    it("Should handle comparison operators", () => {
        expect(parse(lex("let x = 1 + 1 == 2"))).toEqual([
            letNode("x", [
                new Operation(
                    [new Operation(1, operatorTypes.ADDITION, 1)],
                    operatorTypes.EQUAL,
                    2
                ),
            ]),
        ]);
    });

    it("Should handle string operands", () => {
        expect(parse(lex('let s = "a" + "b"'))).toEqual([
            letNode("s", [new Operation("a", operatorTypes.ADDITION, "b")]),
        ]);
        expect(parse(lex('let s = "hi"'))).toEqual([
            letNode("s", [new Operation("hi", operatorTypes.LEAVE_AS_IS, null)]),
        ]);
    });

    it("Should not let an expression run past the end of its line", () => {
        const ast = parse(lex("let a = 1 + 2 * 3\nlet b = (4 - 1) / 3\n"));
        expect(ast.length).toBe(2);
        expect(ast[0].value.name).toBe("a");
        expect(ast[1].value.name).toBe("b");
    });

    it("Should throw error for unopened/unclosed brackets", () => {
        expect(() => parse(lex("let x = (1 + 2"))).toThrow(Error);
        expect(() => parse(lex("let x = 1 + 2)"))).toThrow(Error);
    });
});
