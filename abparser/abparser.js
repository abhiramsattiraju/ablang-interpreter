let StreamWalker = require('../stream_walker.js');
const tokenTypes = require('../token_types.js');
const { SYNTAX_ERROR, UNSUPPORTED_ERROR, REPORT_THIS_BUG } = require('../exceptions.js');
const {
    NODE_TYPE_PRINT_STATEMENT,
    NODE_TYPE_NUMBER,
    NODE_TYPE_OPERATOR,
    NODE_TYPE_STRING,
    NODE_TYPE_EXPRESSION,
    NODE_TYPE_BOOLEAN
} = require('./ast_node_types.js');
const {Node, Operation} = require('./node_classes.js');
const exceptions = require('../exceptions.js');
const operator_types = require('./operator_types.js');
const Token = require('../token_class.js');
const { cloneStreamWalker } = require('../clone_stream_walker.js');


// Parse a token stream (a list of tokens) into an AST (a list of nodes).
function parse(token_stream) {
    let tokenStreamWalker = new StreamWalker(token_stream);
    let ast = [];

    // Loop through the token stream
    while(!tokenStreamWalker.reached_end()) {    
        let output = parseNode(tokenStreamWalker);

        if(output === null) {
            continue;
        }

        tokenStreamWalker = output.tokenStreamWalker;
        ast.push(output.node);
    }

    return ast;
}


// Parses the next node in a token stream, including the nested nodes.
// Moves the token stream walker forward, till the first token of the next node.
// Returns an object with the node property as the parsed node and
// tokenStreamWalker property as the new token stream walker moved forward.
//
// If an expression is to be parsed by this function, the expression needs to
// be wrapped by round brackets.
//
// Returns null if the current token is a newline character.
function parseNode(tokenStreamWalker) {
    // The node that will be parsed
    let node = new Node(null, null);

    // Parse the node on a case-by-case basis

    // Round brackets
    if(tokenStreamWalker.currentElement.type ===
       tokenTypes.TOKEN_TYPE_ROUND_BRACKET) {
        let node_stage1 = parseExpression1(tokenStreamWalker);
        tokenStreamWalker = node_stage1.tokenStreamWalker;

        node = parseExpression2(node_stage1.node);
    }

    // Number
    else if(tokenStreamWalker.currentElement.type ===
            tokenTypes.TOKEN_TYPE_NUMBER) {
        node.type = NODE_TYPE_NUMBER;
        node.value = tokenStreamWalker.currentElement.value;
        tokenStreamWalker.forward();
    }

    // String
    else if(tokenStreamWalker.currentElement.type ===
            tokenTypes.TOKEN_TYPE_STRING) {
        node.type = NODE_TYPE_STRING;
        node.value = tokenStreamWalker.currentElement.value;
        tokenStreamWalker.forward();
    }

    // Operator
    else if(tokenStreamWalker.currentElement.type ===
            tokenTypes.TOKEN_TYPE_OPERATOR) {
        node.type = NODE_TYPE_OPERATOR;
        node.value = tokenStreamWalker.currentElement.value;
        tokenStreamWalker.forward();
    }

    // Keyword
    else if(tokenStreamWalker.currentElement.type ===
            tokenTypes.TOKEN_TYPE_KEYWORD) {
        let output = parseKeyword(tokenStreamWalker);
        node = output.node;
        tokenStreamWalker = output.tokenStreamWalker;
    }

    // Name
    else if(tokenStreamWalker.currentElement.type ===
            tokenTypes.TOKEN_TYPE_NAME) {
        exceptions.raiseException(UNSUPPORTED_ERROR,
            'Names are not supported yet.');
    }

    // Blank line
    else if(tokenStreamWalker.currentElement.type ===
            tokenTypes.TOKEN_TYPE_NEWLINE) {
        tokenStreamWalker.forward();

        return null;
    }

    // Invalid token
    else {
        exceptions.raiseException(REPORT_THIS_BUG,
            "Parser recieved an invalid token from the lexer.");
    }

    return {
        node: node,
        tokenStreamWalker: tokenStreamWalker
    };
}


function parseKeyword(tokenStreamWalker) {
    let node = new Node();

    // print
    if(tokenStreamWalker.currentElement.value === 'print') {
        tokenStreamWalker.forward();  // Skipt the 'print' keyword.

        node.type = NODE_TYPE_PRINT_STATEMENT;

        // Wrap the expression to print in round brackets, to handle
        // bracketless expressions.
        tokenStreamWalker.insertAtCurrentIndex(
            new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, '(')
        );

        let closingBracketIndex = tokenStreamWalker.index;
        for(temporaryWalker = cloneStreamWalker(tokenStreamWalker);
            temporaryWalker.currentElement.type !== tokenTypes.TOKEN_TYPE_NEWLINE;
            temporaryWalker.forward()) {
            closingBracketIndex++;
        }

        tokenStreamWalker.insertAtGivenIndex(closingBracketIndex,
            new Token(tokenTypes.TOKEN_TYPE_ROUND_BRACKET, ')')
        )

        let stage1 = parseExpression1(tokenStreamWalker);
        tokenStreamWalker = stage1.tokenStreamWalker;

        node.value = parseExpression2(stage1.node);

        if(!tokenStreamWalker.reached_end) {
            tokenStreamWalker.forward();  // Skip the newline.
        }
    } else if(tokenStreamWalker.currentElement.value === 'True') {
        tokenStreamWalker.forward();

        node.type = NODE_TYPE_BOOLEAN;
        node.value = true;
    } else if(tokenStreamWalker.currentElement.value === 'False') {
        tokenStreamWalker.forward();

        node.type = NODE_TYPE_BOOLEAN;
        node.value = false;
    }

    // Invalid keyword
    else {
        exceptions.raiseException(exceptions.REPORT_THIS_BUG,
            'Parser recieved an invalid keyword from lexer.');
    }

    return {
        node: node,
        tokenStreamWalker: tokenStreamWalker
    };
}

// Functions for parsing an expression wrapped in round brackets.

// Does the first stage of parsing expression, turning a list of tokens
// into a list of nodes for operators and values.
//
// Example:
// (2 + (1/2)) -> [number node, operator node, fully parsed round bracket node]
//
// Takes a token stream walker at the start position of the expression.
// Returns an object with node as the partially parsed expression node and
// tokenStreamWalker as the token stream walker at the start of the next node.
function parseExpression1(tokenStreamWalker) {
    let node = {};

    // Found a closing bracket without an opening bracket
    if(tokenStreamWalker.currentElement.value === ')') {
        exceptions.raiseException(SYNTAX_ERROR,
            `Bracket error at token ${tokenStreamWalker.index}.`);
    }

    node.type = NODE_TYPE_EXPRESSION;
    node.value = [];

    tokenStreamWalker.forward();  // Skip the opening bracket

    // Get the bracket's value by parsing all the nodes till reaching a
    // closing bracket

    // While the closing bracket is not reached. (bracket nodes inside the
    // bracket node are handled within the loop itself.)
    while(!expressionReachedEnd(tokenStreamWalker)) {
        // Parse all the nodes inside
        let output = parseNode(tokenStreamWalker);
        let newNode = output.node;
        tokenStreamWalker = output.tokenStreamWalker;
        node.value.push(newNode);
    }
    tokenStreamWalker.forward();  // Skip the closing bracket

    return {
        node: node,
        tokenStreamWalker: tokenStreamWalker
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
function parseExpression2(expression) {
    if(expression.value.length === 1) {
        return new Node(NODE_TYPE_EXPRESSION, [new Operation(
            expression.value[0].value, operator_types.LEAVE_AS_IS, null
        )]);
    }

    handleBracketSyntaxErrors(expression);


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
  * more operators; i.e. trinomials and beyond.
  *
  * Examples of trinomials:
  * 1 + 2 - 3
  * 1 * 2 - 3 (Although 1*2 is one term in mathematics, this function considers
  * it as two terms.)
  *
  * Returns an array of operations.
 */
function parseTrinomialsAndBeyond(expression) {
    parseOperation(expression, '/');
    parseOperation(expression, '*');
    parseAdditionAndSubtraction(expression);
    parseOperation(expression, '>');
    parseOperation(expression, '<');
    parseOperation(expression, '>=');
    parseOperation(expression, '<=');
    parseOperation(expression, '==');
    parseOperation(expression, '!=');

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

    for(let index = 1; index <= expression.value.length - 2; index++) {
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
        }
    }
}

/**
 * Parses addition *and* subtraction operations in left-to-right order.
 * Behaves similarly to parseOperation(), but it does not take an
 * operator string.
 * 
 * @param {Node} expression The expression node to parse.
 */
function parseAdditionAndSubtraction(expression) {
    for(let index = 1; index <= expression.value.length - 2; index++) {
        let operator = expression.value[index].value;
        
        if(operator === '+' || operator === '-') {
            let leftOperand = intoOperand(expression.value[index - 1]);
            let rightOperand = intoOperand(expression.value[index + 1]);

            expression.value[index] = new Operation(
                leftOperand,
                getOperatorType(operator),
                rightOperand
            );

            expression.value.splice(index - 1, 1);
            expression.value.splice(index, 1);

            index--;
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

function expressionReachedEnd(tokenStreamWalker) {
    if(tokenStreamWalker.reached_end()) {
        return true;
    }

    if(tokenStreamWalker.currentElement.type ===
       tokenTypes.TOKEN_TYPE_ROUND_BRACKET &&
       tokenStreamWalker.currentElement.value === ')') {
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
    } else if(operatorString === '>') {
        return operator_types.GREATER_THAN;
    } else if(operatorString === '<') {
        return operator_types.LESS_THAN;
    } else if(operatorString === '>=') {
        return operator_types.GREATER_THAN_OR_EQUAL;
    } else if(operatorString === '<=') {
        return operator_types.LESS_THAN_OR_EQUAL;
    } else if(operatorString === '==') {
        return operator_types.EQUAL;
    } else if(operatorString === '!=') {
        return operator_types.NOT_EQUAL;
    } else {
        exceptions.raiseException(REPORT_THIS_BUG,
            `An operator was invalidly parsed: ${operatorString}`);
    }
}


module.exports = {parse, parse_node: parseNode};
