import { StreamWalker } from "../stream_walker";
import { Token } from "../token_class";
import { Node } from "./node_classes";
import { NODE_TYPE_PRINT_STATEMENT } from "./ast_node_types";
import * as tokenTypes from "../token_types";
import { cloneStreamWalker } from "../clone_stream_walker";
import { parseExpression1, parseExpression2 } from "./parse_expression";

export function parsePrintKeyword(
    tokenStreamWalker: StreamWalker<Token>
): { node: Node; tokenStreamWalker: StreamWalker<Token> } {
    const node = new Node();
    tokenStreamWalker.forward(); // Skip the 'print' keyword.

    node.type = NODE_TYPE_PRINT_STATEMENT;

    // Wrap the expression to print in round brackets, to handle
    // bracketless expressions.
    tokenStreamWalker.insertAtCurrentIndex(
        new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, "(")
    );

    let closingBracketIndex = tokenStreamWalker.index;
    const temporaryWalker = cloneStreamWalker(tokenStreamWalker);
    while (
        temporaryWalker.currentElement !== null &&
        temporaryWalker.currentElement.type !== tokenTypes.TOKEN_TYPE_NEWLINE
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

    node.value = parseExpression2(stage1.node);

    if (!tokenStreamWalker.reached_end()) {
        tokenStreamWalker.forward(); // Skip the newline.
    }

    return {
        node: node,
        tokenStreamWalker: tokenStreamWalker,
    };
}
