import { StreamWalker } from "../stream_walker";
import { Token } from "../token_class";
import { Node, IfStatement } from "./node_classes";
import { NODE_TYPE_IF_STATEMENT, NODE_TYPE_PRINT_STATEMENT } from "./ast_node_types";
import * as tokenTypes from "../token_types";
import * as exceptions from "../exceptions";
import { cloneStreamWalker } from "../clone_stream_walker";
import { parseExpression1, parseExpression2 } from "./parse_expression";
import { parseNode } from "./parse_node";
import { parseIndentedBlock } from "./indentation";

export function parseIfKeyword(
    tokenStreamWalker: StreamWalker<Token>
): { node: Node; tokenStreamWalker: StreamWalker<Token> } {
    const node = new Node();
    tokenStreamWalker.forward(); // Skip the 'if' keyword.

    node.type = NODE_TYPE_IF_STATEMENT;

    if (tokenStreamWalker.currentElement === null) {
        exceptions.raiseException(
            exceptions.SYNTAX_ERROR,
            "Expected condition after 'if'."
        );
    }

    // Wrap the condition expression in round brackets up to the colon.
    tokenStreamWalker.insertAtCurrentIndex(
        new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, "(")
    );

    let closingBracketIndex = tokenStreamWalker.index;
    const temporaryWalker = cloneStreamWalker(tokenStreamWalker);
    while (
        temporaryWalker.currentElement &&
        temporaryWalker.currentElement.type !== tokenTypes.TOKEN_TYPE_COLON &&
        temporaryWalker.currentElement.type !== tokenTypes.TOKEN_TYPE_NEWLINE
    ) {
        closingBracketIndex++;
        temporaryWalker.forward();
    }

    if (
        temporaryWalker.currentElement?.type !== tokenTypes.TOKEN_TYPE_COLON
    ) {
        exceptions.raiseException(
            exceptions.SYNTAX_ERROR,
            "Expected ':' after if condition."
        );
    }

    tokenStreamWalker.insertAtGivenIndex(
        closingBracketIndex,
        new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, ")")
    );

    const stage1 = parseExpression1(tokenStreamWalker);
    tokenStreamWalker = stage1.tokenStreamWalker;

    if (stage1.node.value.length === 0) {
        exceptions.raiseException(
            exceptions.SYNTAX_ERROR,
            "If statement condition cannot be empty."
        );
    }

    for (const n of stage1.node.value) {
        if (
            n.type === NODE_TYPE_PRINT_STATEMENT ||
            n.type === NODE_TYPE_IF_STATEMENT
        ) {
            exceptions.raiseException(
                exceptions.SYNTAX_ERROR,
                "Condition must be an expression."
            );
        }
    }

    const conditionNode = parseExpression2(stage1.node);


    tokenStreamWalker.forward(); // Skip the colon.

    const bodyNodes: Node[] = [];

    // Single-line then-block (statement directly follows colon on the same line)
    if (tokenStreamWalker.currentElement?.type !==
        tokenTypes.TOKEN_TYPE_NEWLINE) {
        while (
            !tokenStreamWalker.reached_end() &&
            tokenStreamWalker.currentElement?.type !== tokenTypes.TOKEN_TYPE_NEWLINE
        ) {
            const output = parseNode(tokenStreamWalker);
            if (output === null) {
                break;  // Syntax error is handled later.
            }
            tokenStreamWalker = output.tokenStreamWalker;
            bodyNodes.push(output.node);
        }

        if (tokenStreamWalker.currentElement?.type === tokenTypes.TOKEN_TYPE_NEWLINE) {
            tokenStreamWalker.forward(); // Skip the newline.
        }
    } else {
        // Multi-line then-block: skip the newline after colon, then parse indented block.
        tokenStreamWalker.forward(); // Skip the NEWLINE.

        if ((tokenStreamWalker.currentElement?.type as number) === tokenTypes.TOKEN_TYPE_INDENT) {
            const indentedBlock = parseIndentedBlock(tokenStreamWalker);
            tokenStreamWalker = indentedBlock.tokenStreamWalker;
            bodyNodes.push(...indentedBlock.nodes);
        }
    }

    if (bodyNodes.length === 0) {
        exceptions.raiseException(
            exceptions.SYNTAX_ERROR,
            "If statement must have a then-block."
        );
    }

    node.value = new IfStatement(conditionNode, bodyNodes);

    return {
        node: node,
        tokenStreamWalker: tokenStreamWalker,
    };
}
