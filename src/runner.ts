import {
    NODE_TYPE_PRINT_STATEMENT,
    NODE_TYPE_IF_STATEMENT,
    NODE_TYPE_ASSIGNMENT_STATEMENT,
} from "./abparser/ast_node_types";
import * as exceptions from "./exceptions";
import * as operator_types from "./abparser/operator_types";
import {
    Node,
    IfStatement,
    AssignmentStatement,
    VariableReference,
} from "./abparser/node_classes";

export type Environment = Map<string, any>;

// Run an ABLang AST. Variables live in `environment`, which is shared with
// nested blocks.
export default function run(
    ast: Node[],
    environment: Environment = new Map()
): void {
    ast.forEach((node) => {
        if (node.type === NODE_TYPE_PRINT_STATEMENT) {
            let result = evaluate(node.value.value, environment);
            if (typeof result === "boolean") {
                result = printBoolean(result);
            }
            console.log(result);
        } else if (node.type === NODE_TYPE_IF_STATEMENT) {
            const ifStmt = node.value as IfStatement;
            const conditionResult = evaluate(ifStmt.condition.value, environment);
            if (conditionResult) {
                run(ifStmt.body, environment);
            }
        } else if (node.type === NODE_TYPE_ASSIGNMENT_STATEMENT) {
            const assignment = node.value as AssignmentStatement;
            // The expression is evaluated dynamically, at run time.
            environment.set(
                assignment.name,
                evaluate(assignment.expression.value, environment)
            );
        } else {
            exceptions.raiseException(
                exceptions.UNSUPPORTED_ERROR,
                `Only print, if and let statements are supported. Current node: ${JSON.stringify(node)}`
            );
        }
    });
}

/**
 * Resolves an operand: a nested operation list is evaluated, a variable
 * reference is looked up, and anything else is a literal.
 */
function resolveOperand(operand: any, environment: Environment): any {
    if (Array.isArray(operand)) {
        return evaluate(operand, environment);
    }
    if (operand instanceof VariableReference) {
        if (!environment.has(operand.name)) {
            exceptions.raiseException(
                exceptions.RUNTIME_ERROR,
                `Undefined variable '${operand.name}'`
            );
        }
        return environment.get(operand.name);
    }
    return operand;
}

/**
 * Evaluates an expression value list of operations.
 *
 * @param {any[]} expressionValue The value of an expression node.
 * @param {Environment} environment The variables in scope.
 * @returns {any}
 */
function evaluate(expressionValue: any[], environment: Environment): any {
    let result: any;

    expressionValue.forEach((original) => {
        // Work on a copy so the AST is never mutated.
        const operation = {
            operator: original.operator,
            leftOperand: resolveOperand(original.leftOperand, environment),
            rightOperand: resolveOperand(original.rightOperand, environment),
        };

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

    return result;
}

function printBoolean(boolean: boolean): string {
    return boolean ? "True" : "False";
}
