let StreamWalker = require('../stream_walker.js');
const token_types = require('../token_types.js');
const { SYNTAX_ERROR, UNSUPPORTED_ERROR, REPORT_THIS_BUG } = require('../exceptions.js');
const {
    NODE_TYPE_PRINT_STATEMENT,
    NODE_TYPE_NUMBER,
    NODE_TYPE_OPERATOR,
    NODE_TYPE_STRING,
    NODE_TYPE_EXPRESSION,
    NODE_TYPE_LEAVE_AS_IS
} = require('./ast_node_types.js');
const {Node, Operation} = require('./node_classes.js');
const exceptions = require('../exceptions.js');


// Parse a token stream (a list of tokens) into an AST (a list of nodes).
function parse(token_stream) {
    let token_stream_walker = new StreamWalker(token_stream);
    let ast = [];

    // Loop through the token stream
    while(!token_stream_walker.reached_end()) {    
        let output = parse_node(token_stream_walker);
        token_stream_walker = output.token_stream_walker;
        ast.push(output.node);
    }

    return ast;
}


// Parses the next node in a token stream, including the nested nodes.
// Moves the token stream walker forward, till the first token of the next node.
// Returns an object with the node property as the parsed node and
// token_stream_walker property as the new token stream walker moved forward.
//
// The isBracketlessExpression parameter is used to indicate that the node
// is not part of a round bracket expression, but _may_ have one or more
// operations.
function parse_node(token_stream_walker, isBracketlessExpression=false) {
    // The node that will be parsed
    let node = new Node(null, null);

    // Parse the node on a case-by-case basis

    // Round brackets
    if(token_stream_walker.current_element.type ===
       token_types.TOKEN_TYPE_ROUND_BRACKET) {
        // Round bracket parsing stages:
        //
        // 1 - Convert a list of tokens into a list of nodes for operators and
        // values.
        // 2 - Convert the list from value, op, value to value + op, value.
        // 3 - Parse the bracket nodes.
        // 4 - Do the division operations.
        // 5 - Do the multiplications.
        // 6 - Do the additions.
        // 7 - Do the subtractions.

        let node_stage1 = parseExpression1(token_stream_walker);
        node = node_stage1.node;
        token_stream_walker = node_stage1.token_stream_walker;

        node = parseExpression2(node);
    } else if(isBracketlessExpression) {
        let node_stage1 = parseExpression1(token_stream_walker, false);
        node = node_stage1.node;
        token_stream_walker = node_stage1.token_stream_walker;

        node = parseExpression2(node, false);
    }

    // Number
    else if(token_stream_walker.current_element.type ===
            token_types.TOKEN_TYPE_NUMBER) {
        node.type = NODE_TYPE_NUMBER;
        node.value = token_stream_walker.current_element.value;
        token_stream_walker.forward();
    }

    // Semicolon
    else if(token_stream_walker.current_element.type ===
            token_types.TOKEN_TYPE_SEMICOLON) {
        console.log(`Token number ${token_stream_walker.index} is a semicolon.`);
        exceptions.raiseException(SYNTAX_ERROR,
            'There is a semicolon that is not part of a statement.');
    }

    // String
    else if(token_stream_walker.current_element.type ===
            token_types.TOKEN_TYPE_STRING) {
        node.type = NODE_TYPE_STRING;
        node.value = token_stream_walker.current_element.value;
        token_stream_walker.forward();
    }

    // Operator
    else if(token_stream_walker.current_element.type ===
            token_types.TOKEN_TYPE_OPERATOR) {
        node.type = NODE_TYPE_OPERATOR;
        node.value = token_stream_walker.current_element.value;
        token_stream_walker.forward();
    }

    // Keyword
    else if(token_stream_walker.current_element.type ===
            token_types.TOKEN_TYPE_KEYWORD) {
        let output = parse_keyword(token_stream_walker);
        node = output.node;
        token_stream_walker = output.token_stream_walker;
    }

    // Name
    else if(token_stream_walker.current_element.type ===
            token_types.TOKEN_TYPE_NAME) {
        exceptions.raiseException(UNSUPPORTED_ERROR,
            'Names are not supported yet.');
    }

    // Invalid token
    else {
        exceptions.raiseException(REPORT_THIS_BUG,
            "Parser recieved an invalid token from the lexer.");
    }

    return {
        node: node,
        token_stream_walker: token_stream_walker
    };
}


function parse_keyword(token_stream_walker) {
    let node = new Node();

    // print
    if(token_stream_walker.current_element.value === 'print') {
        token_stream_walker.forward();  // Skipt the 'print' keyword.

        node.type = NODE_TYPE_PRINT_STATEMENT;
        node.value = [];

        // Parse all the nodes till the semicolon.
        while(token_stream_walker.current_element.type !==
              token_types.TOKEN_TYPE_SEMICOLON) {
            let hasRoundBrackets = false;

            if(
                token_stream_walker.current_element.value ===
                token_types.TOKEN_TYPE_ROUND_BRACKET
            ) {
                hasRoundBrackets = true;
            }

            let output = parse_node(token_stream_walker, hasRoundBrackets);
            let new_node = output.node;

            if(new_node.type === NODE_TYPE_PRINT_STATEMENT) {
                exceptions.raiseException(SYNTAX_ERROR,
                    'Print statements cannot be printed.');
            }

            token_stream_walker = output.token_stream_walker;
            node.value.push(new_node);
        }

        // Skip the semicolon
        token_stream_walker.forward();
    }

    // Invalid keyword
    else {
        exceptions.raiseException(exceptions.REPORT_THIS_BUG,
            'Parser recieved an invalid keyword from lexer.');
    }

    return {
        node: node,
        token_stream_walker: token_stream_walker
    };
}

// Functions for parsing expression.

// Does the first stage of parsing expression, turning a list of tokens
// into a list of nodes for operators and values.
//
// Example:
// (2 + (1/2)) -> [number node, operator node, fully parsed round bracket node]
//
// Takes a token stream walker at the start position of the expression.
// Returns an object with node as the partially parsed expression node and
// token_stream_walker as the token stream walker at the start of the next node.
function parseExpression1(token_stream_walker, isRoundBrackets=true) {
    let node = {};

    // Found a closing bracket without an opening bracket
    if(token_stream_walker.current_element.value === ')') {
        exceptions.raiseException(SYNTAX_ERROR,
            "Bracket error.");
    }

    node.type = NODE_TYPE_EXPRESSION;
    node.value = [];

    if(isRoundBrackets) {
        token_stream_walker.forward();  // Skip the opening bracket
    }
    // Get the bracket's value by parsing all the nodes till reaching a
    // closing bracket

    // While the closing bracket is not reached. (bracket nodes inside the
    // bracket node are handled within the loop itself.)
    while(!expressionReachedEnd(token_stream_walker, isRoundBrackets)) {
        // Parse all the nodes inside
        let output = parse_node(token_stream_walker);
        let new_node = output.node;
        token_stream_walker = output.token_stream_walker;
        node.value.push(new_node);
    }
    if(isRoundBrackets) {
        token_stream_walker.forward();  // Skip the closing bracket
    }

    return {
        node: node,
        token_stream_walker: token_stream_walker
    };
}

// Does the second stage of parsing expression, turning a expression node
// in the form [value, operator, value] into [(value, operator), value].
//
// Example:
// [number node, operator node, fully parsed round bracket node]
// becomes
// [number and operator, fully parsed round bracket node]
//
// Takes a expression node that has been parsed in stage 1 of expression
// parsing.
// Returns a fully parsed expression node.
function parseExpression2(expression, isRoundBrackets=true) {
    if(expression.value.length === 1) {
        return new Node(expression.value[0].type, new Operation(
            expression.value[0].value, NODE_TYPE_LEAVE_AS_IS
        ));
    }

    if(isRoundBrackets) {
        handleBracketSyntaxErrors(expression);
    }

    let parsedNodes = [];

    for(let index = 0; index < expression.value.length; index += 2) {
        let leftOperand = expression.value[index];

        if(!(leftOperand.type === NODE_TYPE_NUMBER ||
             leftOperand.type === NODE_TYPE_EXPRESSION)) {
            exceptions.raiseException(UNSUPPORTED_ERROR,
                'Operations are supported only with numbers.');
        }

        if(index === expression.value.length - 1) {
            parsedNodes.push(new Operation(leftOperand, NODE_TYPE_LEAVE_AS_IS));
            break;
        }

        let operator = expression.value[index + 1];

        let operation = new Operation(leftOperand, operator);
        parsedNodes.push(operation);
    }

    return new Node(NODE_TYPE_EXPRESSION, parsedNodes);
}

// Takes a expression node that has been parsed in stage 1 of expression
// parsing.
function handleBracketSyntaxErrors(roundBrackets) {
    if(roundBrackets.type !== NODE_TYPE_EXPRESSION) {
        exceptions.raiseException(REPORT_THIS_BUG,
            'parseRoundBrackets2() recieved a non-round-brackets node.');
    }

    if(roundBrackets.value.length < 3) {
        exceptions.raiseException(SYNTAX_ERROR,
            'Bracket error.');
    }
}

function expressionReachedEnd(token_stream_walker, isRoundBrackets) {
    if(isRoundBrackets &&
       token_stream_walker.current_element.type ===
       token_types.TOKEN_TYPE_ROUND_BRACKET &&
       token_stream_walker.current_element.value === ')') {
        return true;
    } else if(!isRoundBrackets &&
              token_stream_walker.current_element.type ===
              token_types.TOKEN_TYPE_SEMICOLON) {
        return true;
    }

    return false;
}


module.exports = {parse, parse_node};
