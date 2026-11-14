import { StreamWalker } from "../stream_walker";
import { Token } from "../token_class";
import { Node, AssignmentStatement } from "./node_classes";
import {
    NODE_TYPE_ASSIGNMENT_STATEMENT,
    NODE_TYPE_PRINT_STATEMENT,
    NODE_TYPE_IF_STATEMENT,
} from "./ast_node_types";
import * as tokenTypes from "../token_types";
import * as exceptions from "../exceptions";
import { cloneStreamWalker } from "../clone_stream_walker";
import { parseExpression1, parseExpression2 } from "./parse_expression";

// Parses `let <name> = <expression>` into an assignment statement node whose
// value is an AssignmentStatement(name, expression). The expression is only
// parsed here; it is evaluated dynamically at run time.
export function parseLetKeyword(
    tokenStreamWalker: StreamWalker<Token>
): { node: Node; tokenStreamWalker: StreamWalker<Token> } {
    const node = new Node();
    tokenStreamWalker.forward(); // Skip the 'let' keyword.

    // Expect a name token followed by an assignment token.
    const nameToken = tokenStreamWalker.currentElement;
    if (nameToken === null || nameToken.type !== tokenTypes.TOKEN_TYPE_NAME) {
        exceptions.raiseException(
            exceptions.SYNTAX_ERROR,
            "Expected a name after 'let'."
        );
    }
    tokenStreamWalker.forward(); // Skip the name.

    const assignmentToken = tokenStreamWalker.currentElement;
    if (
        assignmentToken === null ||
        assignmentToken.type !== tokenTypes.TOKEN_TYPE_ASSIGNMENT
    ) {
        exceptions.raiseException(
            exceptions.SYNTAX_ERROR,
            "Expected '=' after the name in a 'let' statement."
        );
    }
    tokenStreamWalker.forward(); // Skip the '='.

    // The expression must exist.
    const first = tokenStreamWalker.currentElement;
    if (
        first === null ||
        first.type === tokenTypes.TOKEN_TYPE_NEWLINE ||
        first.type === tokenTypes.TOKEN_TYPE_DEDENT
    ) {
        exceptions.raiseException(
            exceptions.SYNTAX_ERROR,
            "Expected an expression after '=' in a 'let' statement."
        );
    }

    // Wrap the expression in round brackets, to handle bracketless expressions.
    tokenStreamWalker.insertAtCurrentIndex(
        new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, "(")
    );

    let closingBracketIndex = tokenStreamWalker.index;
    const temporaryWalker = cloneStreamWalker(tokenStreamWalker);
    while (
        temporaryWalker.currentElement &&
        temporaryWalker.currentElement.type !== tokenTypes.TOKEN_TYPE_NEWLINE &&
        temporaryWalker.currentElement.type !== tokenTypes.TOKEN_TYPE_DEDENT
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

    // Statements are not expressions.
    if (stage1.node.value.length === 0) {
        exceptions.raiseException(
            exceptions.SYNTAX_ERROR,
            "Expected an expression after '=' in a 'let' statement."
        );
    }
    for (const n of stage1.node.value) {
        if (
            n.type === NODE_TYPE_PRINT_STATEMENT ||
            n.type === NODE_TYPE_IF_STATEMENT ||
            n.type === NODE_TYPE_ASSIGNMENT_STATEMENT
        ) {
            exceptions.raiseException(
                exceptions.SYNTAX_ERROR,
                "The value of a 'let' statement must be an expression."
            );
        }
    }

    const expression = parseExpression2(stage1.node);

    node.type = NODE_TYPE_ASSIGNMENT_STATEMENT;
    node.value = new AssignmentStatement(String(nameToken.value), expression);

    if (tokenStreamWalker.currentElement?.type === tokenTypes.TOKEN_TYPE_NEWLINE) {
        tokenStreamWalker.forward(); // Skip the newline.
    }

    return {
        node: node,
        tokenStreamWalker: tokenStreamWalker,
    };
}
