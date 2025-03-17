const { NODE_TYPE_PRINT_STATEMENT, NODE_TYPE_NUMBER, NODE_TYPE_STRING } = require("./abparser/ast_node_types");
const exceptions = require("./exceptions");
const operator_types = require("./abparser/operator_types");

// Run an ABLang AST
function run(ast) {
    ast.forEach((node, index) => {
        if(node.type === NODE_TYPE_PRINT_STATEMENT) {
            console.log(evaluate(node.value.value));
        } else {
            exceptions.raiseException(exceptions.UNSUPPORTED_ERROR,
                "Only print statements are supported"
            );
        }
    })
}

/**
 * 
 * @param {Array} expressionValue The value of an expression node.
 * @returns 
 */
function evaluate(expressionValue) {
    let result;

    expressionValue.forEach((operation) => {
        if(Array.isArray(operation.leftOperand)) {
            operation.leftOperand = evaluate(operation.leftOperand);
        } if(Array.isArray(operation.rightOperand)) {
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
            
            default:
                exceptions.raiseException(
                    exceptions.REPORT_THIS_BUG,
                    `Unknown operator type: ${operation.operator}`
                );
        }
    });

    return result;
}


module.exports = run;
