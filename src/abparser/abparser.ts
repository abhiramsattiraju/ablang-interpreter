import { StreamWalker } from "../stream_walker";
import { Node } from "./node_classes";
import * as exceptions from "../exceptions";
import { Token } from "../token_class";
import { parseNode } from "./parse_node";
import { parsePrintKeyword } from "./parse_print_keyword";
import { parseIfKeyword } from "./parse_if_keyword";
import { parseTrueKeyword } from "./parse_true_keyword";
import { parseFalseKeyword } from "./parse_false_keyword";

export { parseNode };

// Parse a token stream (a list of tokens) into an AST (a list of nodes).
export function parse(token_stream: Token[]): Node[] {
    let tokenStreamWalker = new StreamWalker<Token>(token_stream);
    const ast: Node[] = [];

    // Loop through the token stream
    while (!tokenStreamWalker.reached_end()) {
        const output = parseNode(tokenStreamWalker);

        if (output === null) {
            continue;
        }

        tokenStreamWalker = output.tokenStreamWalker;
        ast.push(output.node);
    }

    return ast;
}

export function parseKeyword(
    tokenStreamWalker: StreamWalker<Token>
): { node: Node; tokenStreamWalker: StreamWalker<Token> } {
    const current = tokenStreamWalker.currentElement;
    if (current === null) {
        exceptions.raiseException(
            exceptions.REPORT_THIS_BUG,
            "Parser encountered a null token during keyword parsing."
        );
    }

    if (current.value === "print") {
        return parsePrintKeyword(tokenStreamWalker);
    } else if (current.value === "if") {
        return parseIfKeyword(tokenStreamWalker);
    } else if (current.value === "True") {
        return parseTrueKeyword(tokenStreamWalker);
    } else if (current.value === "False") {
        return parseFalseKeyword(tokenStreamWalker);
    } else {
        exceptions.raiseException(
            exceptions.REPORT_THIS_BUG,
            "Parser received an invalid keyword from lexer."
        );
    }
}
