import { StreamWalker } from "../stream_walker";
import { Token } from "../token_class";
import { Node } from "./node_classes";
import { NODE_TYPE_BOOLEAN } from "./ast_node_types";

export function parseFalseKeyword(
    tokenStreamWalker: StreamWalker<Token>
): { node: Node; tokenStreamWalker: StreamWalker<Token> } {
    const node = new Node();
    tokenStreamWalker.forward();

    node.type = NODE_TYPE_BOOLEAN;
    node.value = false;

    return {
        node: node,
        tokenStreamWalker: tokenStreamWalker,
    };
}
