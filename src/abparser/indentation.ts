import { StreamWalker } from "../stream_walker";
import { Token } from "../token_class";
import { Node } from "./node_classes";
import * as tokenTypes from "../token_types";
import * as exceptions from "../exceptions";
import { parseNode } from "./parse_node";

// Parses a block of statements that are indented one level deeper than the
// current position. Expects the token stream to currently point at an INDENT
// token. Consumes tokens up to and including the matching DEDENT token.
//
// Returns the list of parsed statement nodes and the advanced token stream walker.
export function parseIndentedBlock(
    tokenStreamWalker: StreamWalker<Token>
): { nodes: Node[]; tokenStreamWalker: StreamWalker<Token> } {
    if (tokenStreamWalker.currentElement?.type !== tokenTypes.TOKEN_TYPE_INDENT) {
        exceptions.raiseException(
            exceptions.SYNTAX_ERROR,
            "Expected an indented block."
        );
    }

    tokenStreamWalker.forward(); // Skip the INDENT token.

    const nodes: Node[] = [];

    while (
        !tokenStreamWalker.reached_end() &&
        tokenStreamWalker.currentElement?.type !== tokenTypes.TOKEN_TYPE_DEDENT
    ) {
        const output = parseNode(tokenStreamWalker);

        if (output === null) {
            // parseNode returns null for newline tokens (skips them).
            continue;
        }

        tokenStreamWalker = output.tokenStreamWalker;
        nodes.push(output.node);
    }

    if (tokenStreamWalker.currentElement?.type !== tokenTypes.TOKEN_TYPE_DEDENT) {
        exceptions.raiseException(
            exceptions.REPORT_THIS_BUG,
            "Indented block was not closed."
        );
    }

    tokenStreamWalker.forward(); // Skip the DEDENT token.

    return { nodes, tokenStreamWalker };
}
