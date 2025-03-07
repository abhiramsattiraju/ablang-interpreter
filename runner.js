const { NODE_TYPE_PRINT_STATEMENT, NODE_TYPE_NUMBER, NODE_TYPE_STRING } = require("./abparser/ast_node_types");
const exceptions = require("./exceptions");
const operator_types = require("./abparser/operator_types");

// Run an ABLang AST
function run(ast) {
    ast.forEach((node, index) => {
        if(node.type === NODE_TYPE_PRINT_STATEMENT) {
            console.log(evaluate(node.value));
        } else {
            exceptions.raiseException(exceptions.UNSUPPORTED_ERROR,
                "Only print statements are supported"
            );
        }
    })
}

function evaluate(expression) {
    let result;

    expression.value.forEach((operation, index) => {
        if(operation.operator == operator_types.LEAVE_AS_IS) {
            result = operation.leftOperand;
        } else {
            result = null;
        }
    });

    return result;
}


module.exports = run;
