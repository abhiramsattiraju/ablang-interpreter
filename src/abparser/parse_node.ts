import { StreamWalker } from "../stream_walker";
import { Token } from "../token_class";
import { Node } from "./node_classes";
import * as tokenTypes from "../token_types";
import {
    NODE_TYPE_NUMBER,
    NODE_TYPE_STRING,
    NODE_TYPE_OPERATOR,
} from "./ast_node_types";
import * as exceptions from "../exceptions";
import { parseExpression1, parseExpression2 } from "./parse_expression";
import { parseKeyword } from "./abparser";

// Parses the next node in a token stream, including the nested nodes.
// Moves the token stream walker forward, till the first token of the next node.
// Returns an object with the node property as the parsed node and
// tokenStreamWalker property as the new token stream walker moved forward.
//
// If an expression is to be parsed by this function, the expression needs to
// be wrapped by round brackets.
//
// Returns null if the current token is a newline character.
export function parseNode(
    tokenStreamWalker: StreamWalker<Token>
): { node: Node; tokenStreamWalker: StreamWalker<Token> } | null {
    // The node that will be parsed
    let node = new Node(null, null);

    const current = tokenStreamWalker.currentElement;
    if (current === null) {
        exceptions.raiseException(
            exceptions.REPORT_THIS_BUG,
            "Parser encountered a null token before reaching the end of the stream."
        );
    }

    // Parse the node on a case-by-case basis

    // Round brackets
    if (current.type === tokenTypes.TOKEN_TYPE_ROUND_BRACKET) {
        const node_stage1 = parseExpression1(tokenStreamWalker);
        tokenStreamWalker = node_stage1.tokenStreamWalker;

        node = parseExpression2(node_stage1.node);
    }

    // Number
    else if (current.type === tokenTypes.TOKEN_TYPE_NUMBER) {
        node.type = NODE_TYPE_NUMBER;
        node.value = current.value;
        tokenStreamWalker.forward();
    }

    // String
    else if (current.type === tokenTypes.TOKEN_TYPE_STRING) {
        node.type = NODE_TYPE_STRING;
        node.value = current.value;
        tokenStreamWalker.forward();
    }

    // Operator
    else if (current.type === tokenTypes.TOKEN_TYPE_OPERATOR) {
        node.type = NODE_TYPE_OPERATOR;
        node.value = current.value;
        tokenStreamWalker.forward();
    }

    // Keyword
    else if (current.type === tokenTypes.TOKEN_TYPE_KEYWORD) {
        const output = parseKeyword(tokenStreamWalker);
        node = output.node;
        tokenStreamWalker = output.tokenStreamWalker;
    }

    // Name
    else if (current.type === tokenTypes.TOKEN_TYPE_NAME) {
        exceptions.raiseException(
            exceptions.UNSUPPORTED_ERROR,
            "Names are not supported yet."
        );
    }

    // Blank line
    else if (current.type === tokenTypes.TOKEN_TYPE_NEWLINE) {
        tokenStreamWalker.forward();
        return null;
    }

    // INDENT / DEDENT — structural markers consumed by parseIndentedBlock; skip at statement level.
    else if (
        current.type === tokenTypes.TOKEN_TYPE_INDENT ||
        current.type === tokenTypes.TOKEN_TYPE_DEDENT
    ) {
        tokenStreamWalker.forward();
        return null;
    }

    // Invalid token
    else {
        exceptions.raiseException(
            exceptions.REPORT_THIS_BUG,
            "Parser received an invalid token from the lexer."
        );
    }

    return {
        node: node,
        tokenStreamWalker: tokenStreamWalker,
    };
}
