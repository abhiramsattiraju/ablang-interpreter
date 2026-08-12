import { Node, Operation } from "./node_classes";
import * as operator_types from "./operator_types";
import * as exceptions from "../exceptions";

/**
 * Converts a Node or Operation into a format suitable for use as an operand.
 *
 * @param {Node | Operation} nodeOrOperation - The node or operation to convert
 * @returns A single-element array containing the Operation if given an
 * Operation, or a Node's value if given a Node.
 * @throws {Error} If the input is neither a Node nor an Operation
 */
export function intoOperand(nodeOrOperation: Node | Operation): any {
    if (nodeOrOperation instanceof Node) {
        return nodeOrOperation.value;
    } else if (nodeOrOperation instanceof Operation) {
        return [nodeOrOperation];
    } else {
        exceptions.raiseException(
            exceptions.REPORT_THIS_BUG,
            "intoOperand() received a node that was neither an instance of Node nor Operation."
        );
    }
}

export function getOperatorType(operatorString: string): number {
    if (operatorString === "+") {
        return operator_types.ADDITION;
    } else if (operatorString === "-") {
        return operator_types.SUBTRACTION;
    } else if (operatorString === "*") {
        return operator_types.MULTIPLICATION;
    } else if (operatorString === "/") {
        return operator_types.DIVISION;
    } else if (operatorString === ">") {
        return operator_types.GREATER_THAN;
    } else if (operatorString === "<") {
        return operator_types.LESS_THAN;
    } else if (operatorString === ">=") {
        return operator_types.GREATER_THAN_OR_EQUAL;
    } else if (operatorString === "<=") {
        return operator_types.LESS_THAN_OR_EQUAL;
    } else if (operatorString === "==") {
        return operator_types.EQUAL;
    } else if (operatorString === "!=") {
        return operator_types.NOT_EQUAL;
    } else {
        exceptions.raiseException(
            exceptions.REPORT_THIS_BUG,
            `An operator was invalidly parsed: ${operatorString}`
        );
    }
}

/**
 * Parses all occurrences of a type of operation in an expression that has been
 * parsed in stage 1 of expression parsing.
 * Replaces the occurrences of the operation with Operation objects, in the
 * expression's value array.
 *
 * @param {Node} expression The expression node to parse.
 * @param {string} operatorString The operator string for the type of operator to parse.
 */
export function parseOperation(expression: Node, operatorString: string): void {
    const operatorType = getOperatorType(operatorString);

    for (let index = 1; index <= expression.value.length - 2; index++) {
        if (expression.value[index].value === operatorString) {
            const leftOperand = intoOperand(expression.value[index - 1]);
            const rightOperand = intoOperand(expression.value[index + 1]);

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
export function parseAdditionAndSubtraction(expression: Node): void {
    for (let index = 1; index <= expression.value.length - 2; index++) {
        const operator = expression.value[index].value;

        if (operator === "+" || operator === "-") {
            const leftOperand = intoOperand(expression.value[index - 1]);
            const rightOperand = intoOperand(expression.value[index + 1]);

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
export function parseTrinomialsAndBeyond(expression: Node): Operation[] {
    parseOperation(expression, "/");
    parseOperation(expression, "*");
    parseAdditionAndSubtraction(expression);
    parseOperation(expression, ">");
    parseOperation(expression, "<");
    parseOperation(expression, ">=");
    parseOperation(expression, "<=");
    parseOperation(expression, "==");
    parseOperation(expression, "!=");

    return expression.value;
}
