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
const operator_types = require('./operator_types.js');
const exp = require('constants');


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
        token_stream_walker = node_stage1.token_stream_walker;

        node = parseExpression2(node_stage1.node);
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

        let hasRoundBrackets = token_stream_walker.current_element.value ===
            token_types.TOKEN_TYPE_ROUND_BRACKET;

        let stage1 = parseExpression1(token_stream_walker, hasRoundBrackets);
        token_stream_walker = stage1.token_stream_walker;

        node.value = parseExpression2(stage1.node, hasRoundBrackets);


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
        return new Node(NODE_TYPE_EXPRESSION, [new Operation(
            expression.value[0].value, operator_types.LEAVE_AS_IS, null
        )]);
    }

    if(isRoundBrackets) {
        handleBracketSyntaxErrors(expression);
    }

    let parsedNodes = [];

    if(expression.value.length === 3) {
        let leftOperand = intoOperand(expression.value[0]);
        let rightOperand = intoOperand(expression.value[2]);

        parsedNodes.push(new Operation(
            leftOperand, getOperatorType(expression.value[1].value),
            rightOperand
        ));

        return new Node(NODE_TYPE_EXPRESSION, parsedNodes);
    }

    parsedNodes = parseTrinomialsAndBeyond(expression);

    return new Node(NODE_TYPE_EXPRESSION, parsedNodes);
}

/**
 * Converts a Node or Operation into a format suitable for use as an operand.
 * 
 * @param {(Node|Operation)} nodeOrOperation - The node or operation to convert
 * @returns A single-element array containing the Operation if given an
 * Operation, or a Node's value if given a Node.
 * @throws {Error} If the input is neither a Node nor an Operation
 * 
 * Example:
 * - Node {value: 5} -> [5]
 * - Operation object -> [Operation object]
 */
function intoOperand(nodeOrOperation) {
    if(nodeOrOperation instanceof Node) {
        return nodeOrOperation.value;
    } else if(nodeOrOperation instanceof Operation) {
        return [nodeOrOperation];
    } else {
        exceptions.raiseException(REPORT_THIS_BUG,
            'intoOperand() recieved a node that was neither an instance of Node \
nor Operation.'
        );
    }
}

/** Does the second stage of expression parsing for expressions with two or
 ** more operators; i.e. trinomials and beyond.
 **
 ** Examples of trinomials:
 ** 1 + 2 - 3
 ** 1 * 2 - 3 (Although 1*2 is one term in mathematics, this function considers
 ** it as two terms.)
 **
 ** Returns an array of operations.
 */
function parseTrinomialsAndBeyond(expression) {
    parseOperation(expression, '/');

    parseOperation(expression, '*');
    parseOperation(expression, '+');
    parseOperation(expression, '-');

    return expression.value;
}

/**
 * 
 * Parses all occurences of a type of operation in an expression that has been
 * parsed in stage 1 of expression parsing.
 * Replaces the occurences of the operation with Operation objects, in the
 * expression's value array.
 * 
 * @param {Node} expression The expression node to parse.
 * @param {string} operatorString The operator string for the type of operator
 * to parse.
 */
function parseOperation(expression, operatorString) {
    let operatorType = getOperatorType(operatorString);

    for(let index = 1; index <= expression.value.length - 2; index += 2) {
        if(expression.value[index].value === operatorString) {
            let leftOperand = intoOperand(expression.value[index - 1]);
            let rightOperand = intoOperand(expression.value[index + 1]);

            expression.value[index] = new Operation(
                leftOperand,
                operatorType,
                rightOperand
            );

            expression.value.splice(index - 1, 1);
            expression.value.splice(index, 1);

            index--;
        } else {
            continue;
        }
    }
}

// Takes a expression node that has been parsed in stage 1 of expression
// parsing.
function handleBracketSyntaxErrors(roundBrackets) {
    if(roundBrackets.type !== NODE_TYPE_EXPRESSION) {
        exceptions.raiseException(REPORT_THIS_BUG,
            'parseRoundBrackets2() recieved a non-round-brackets node.');
    }

    // length === 3 is handled by the caller.
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

function getOperatorType(operatorString) {
    if(operatorString === '+') {
        return operator_types.ADDITION;
    } else if(operatorString === '-') {
        return operator_types.SUBTRACTION;
    } else if(operatorString === '*') {
        return operator_types.MULTIPLICATION;
    } else if(operatorString === '/') {
        return operator_types.DIVISION;
    } else {
        exceptions.raiseException(REPORT_THIS_BUG,
            'An operator was invalidly parsed.'
        );
    }
}


module.exports = {parse, parse_node};
