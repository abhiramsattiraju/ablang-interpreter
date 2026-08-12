import { StreamWalker } from "../stream_walker";
import { Token } from "../token_class";
import { Node, IfStatement } from "./node_classes";
import { NODE_TYPE_IF_STATEMENT } from "./ast_node_types";
import * as tokenTypes from "../token_types";
import { cloneStreamWalker } from "../clone_stream_walker";
import { parseExpression1, parseExpression2 } from "./parse_expression";
import { parseNode } from "./parse_node";

export function parseIfKeyword(
    tokenStreamWalker: StreamWalker<Token>
): { node: Node; tokenStreamWalker: StreamWalker<Token> } {
    const node = new Node();
    tokenStreamWalker.forward(); // Skip the 'if' keyword.

    node.type = NODE_TYPE_IF_STATEMENT;

    // Wrap the condition expression in round brackets up to the colon.
    tokenStreamWalker.insertAtCurrentIndex(
        new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, "(")
    );

    let closingBracketIndex = tokenStreamWalker.index;
    const temporaryWalker = cloneStreamWalker(tokenStreamWalker);
    while (
        temporaryWalker.currentElement !== null &&
        temporaryWalker.currentElement.type !== tokenTypes.TOKEN_TYPE_COLON
    ) {
        closingBracketIndex++;
        temporaryWalker.forward();
    }

    tokenStreamWalker.insertAtGivenIndex(
        closingBracketIndex,
        new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, ")")
    );

    const stage1 = parseExpression1(tokenStreamWalker);
    tokenStreamWalker = stage1.tokenStreamWalker;

    const conditionNode = parseExpression2(stage1.node);

    if (
        tokenStreamWalker.currentElement !== null &&
        tokenStreamWalker.currentElement.type === tokenTypes.TOKEN_TYPE_COLON
    ) {
        tokenStreamWalker.forward(); // Skip the colon.
    }

    const bodyNodes: Node[] = [];

    // Single-line then-block (statement directly follows colon on the same line)
    if (
        tokenStreamWalker.currentElement !== null &&
        tokenStreamWalker.currentElement.type !== tokenTypes.TOKEN_TYPE_NEWLINE
    ) {
        while (
            !tokenStreamWalker.reached_end() &&
            tokenStreamWalker.currentElement !== null &&
            tokenStreamWalker.currentElement.type !== tokenTypes.TOKEN_TYPE_NEWLINE
        ) {
            const output = parseNode(tokenStreamWalker);
            if (output === null) {
                break;
            }
            tokenStreamWalker = output.tokenStreamWalker;
            bodyNodes.push(output.node);
        }

        if (
            !tokenStreamWalker.reached_end() &&
            tokenStreamWalker.currentElement !== null &&
            tokenStreamWalker.currentElement.type === tokenTypes.TOKEN_TYPE_NEWLINE
        ) {
            tokenStreamWalker.forward(); // Skip the newline.
        }
    } else {
        // Multi-line then-block (statement(s) follow on subsequent lines)
        if (
            tokenStreamWalker.currentElement !== null &&
            tokenStreamWalker.currentElement.type === tokenTypes.TOKEN_TYPE_NEWLINE
        ) {
            tokenStreamWalker.forward(); // Skip the newline after colon.
        }

        while (!tokenStreamWalker.reached_end()) {
            const output = parseNode(tokenStreamWalker);
            if (output === null) {
                continue;
            }
            tokenStreamWalker = output.tokenStreamWalker;
            bodyNodes.push(output.node);
        }
    }

    node.value = new IfStatement(conditionNode, bodyNodes);

    return {
        node: node,
        tokenStreamWalker: tokenStreamWalker,
    };
}
