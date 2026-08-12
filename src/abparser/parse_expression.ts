import { StreamWalker } from "../stream_walker";
import { Token } from "../token_class";
import { Node, Operation } from "./node_classes";
import { NODE_TYPE_EXPRESSION } from "./ast_node_types";
import * as operator_types from "./operator_types";
import * as tokenTypes from "../token_types";
import * as exceptions from "../exceptions";
import { parseNode } from "./parse_node";
import { parseTrinomialsAndBeyond, getOperatorType, intoOperand } from "./parse_operation";

export { intoOperand };

// Takes an expression node that has been parsed in stage 1 of expression parsing.
export function handleBracketSyntaxErrors(roundBrackets: Node): void {
    if (roundBrackets.type !== NODE_TYPE_EXPRESSION) {
        exceptions.raiseException(
            exceptions.REPORT_THIS_BUG,
            "handleBracketSyntaxErrors() received a non-expression node."
        );
    }

    // length === 3 is handled by the caller.
    if (roundBrackets.value.length < 3) {
        exceptions.raiseException(exceptions.SYNTAX_ERROR, "Bracket error.");
    }
}

export function expressionReachedEnd(tokenStreamWalker: StreamWalker<Token>): boolean {
    if (tokenStreamWalker.reached_end()) {
        return true;
    }

    if (
        tokenStreamWalker.currentElement !== null &&
        tokenStreamWalker.currentElement.type === tokenTypes.TOKEN_TYPE_ROUND_BRACKET &&
        tokenStreamWalker.currentElement.value === ")"
    ) {
        return true;
    }

    return false;
}

// Does the first stage of parsing expression, turning a list of tokens
// into a list of nodes for operators and values.
export function parseExpression1(
    tokenStreamWalker: StreamWalker<Token>
): { node: Node; tokenStreamWalker: StreamWalker<Token> } {
    const node = new Node();

    const current = tokenStreamWalker.currentElement;
    if (current === null) {
        exceptions.raiseException(
            exceptions.REPORT_THIS_BUG,
            "Parser encountered a null token during expression parsing."
        );
    }

    // Found a closing bracket without an opening bracket
    if (current.value === ")") {
        exceptions.raiseException(
            exceptions.SYNTAX_ERROR,
            `Bracket error at token ${tokenStreamWalker.index}.`
        );
    }

    node.type = NODE_TYPE_EXPRESSION;
    node.value = [];

    tokenStreamWalker.forward(); // Skip the opening bracket

    while (!expressionReachedEnd(tokenStreamWalker)) {
        const output = parseNode(tokenStreamWalker);
        if (output === null) {
            continue;
        }
        const newNode = output.node;
        tokenStreamWalker = output.tokenStreamWalker;
        node.value.push(newNode);
    }
    tokenStreamWalker.forward(); // Skip the closing bracket

    return {
        node: node,
        tokenStreamWalker: tokenStreamWalker,
    };
}

// Does the second stage of parsing expression, turning an expression node
// in the form [value, operator, value] into [(value, operator), value].
export function parseExpression2(expression: Node): Node {
    if (expression.value.length === 1) {
        return new Node(NODE_TYPE_EXPRESSION, [
            new Operation(expression.value[0].value, operator_types.LEAVE_AS_IS, null),
        ]);
    }

    handleBracketSyntaxErrors(expression);

    let parsedNodes: Operation[] = [];

    if (expression.value.length === 3) {
        const leftOperand = intoOperand(expression.value[0]);
        const rightOperand = intoOperand(expression.value[2]);

        parsedNodes.push(
            new Operation(
                leftOperand,
                getOperatorType(expression.value[1].value),
                rightOperand
            )
        );

        return new Node(NODE_TYPE_EXPRESSION, parsedNodes);
    }

    parsedNodes = parseTrinomialsAndBeyond(expression);

    return new Node(NODE_TYPE_EXPRESSION, parsedNodes);
}
