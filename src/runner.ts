import { NODE_TYPE_PRINT_STATEMENT } from "./abparser/ast_node_types";
import * as exceptions from "./exceptions";
import * as operator_types from "./abparser/operator_types";
import { Node } from "./abparser/node_classes";

// Run an ABLang AST
export default function run(ast: Node[]): void {
    ast.forEach((node) => {
        if (node.type === NODE_TYPE_PRINT_STATEMENT) {
            console.log(evaluate(node.value.value));
        } else {
            exceptions.raiseException(
                exceptions.UNSUPPORTED_ERROR,
                `Only print statements are supported. Current node: ${JSON.stringify(node)}`
            );
        }
    });
}

/**
 * Evaluates an expression value list of operations.
 *
 * @param {any[]} expressionValue The value of an expression node.
 * @returns {any}
 */
function evaluate(expressionValue: any[]): any {
    let result: any;

    expressionValue.forEach((operation) => {
        if (Array.isArray(operation.leftOperand)) {
            operation.leftOperand = evaluate(operation.leftOperand);
        }
        if (Array.isArray(operation.rightOperand)) {
            operation.rightOperand = evaluate(operation.rightOperand);
        }

        switch (operation.operator) {
            case operator_types.LEAVE_AS_IS:
                result = operation.leftOperand;
                break;

            case operator_types.ADDITION:
                result = operation.leftOperand + operation.rightOperand;
                break;

            case operator_types.SUBTRACTION:
                result = operation.leftOperand - operation.rightOperand;
                break;

            case operator_types.MULTIPLICATION:
                result = operation.leftOperand * operation.rightOperand;
                break;

            case operator_types.DIVISION:
                if (operation.rightOperand === 0) {
                    exceptions.raiseException(
                        exceptions.RUNTIME_ERROR,
                        "Division by zero"
                    );
                }
                result = operation.leftOperand / operation.rightOperand;
                break;

            case operator_types.GREATER_THAN:
                result = operation.leftOperand > operation.rightOperand;
                break;

            case operator_types.LESS_THAN:
                result = operation.leftOperand < operation.rightOperand;
                break;

            case operator_types.GREATER_THAN_OR_EQUAL:
                result = operation.leftOperand >= operation.rightOperand;
                break;

            case operator_types.LESS_THAN_OR_EQUAL:
                result = operation.leftOperand <= operation.rightOperand;
                break;

            case operator_types.EQUAL:
                result = operation.leftOperand === operation.rightOperand;
                break;

            case operator_types.NOT_EQUAL:
                result = operation.leftOperand !== operation.rightOperand;
                break;

            default:
                exceptions.raiseException(
                    exceptions.REPORT_THIS_BUG,
                    `Unknown operator type: ${operation.operator}`
                );
        }
    });

    if (typeof result === "boolean") {
        return printBoolean(result);
    }

    return result;
}

function printBoolean(boolean: boolean): string {
    return boolean ? "True" : "False";
}
