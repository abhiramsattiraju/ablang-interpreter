const { NODE_TYPE_PRINT_STATEMENT, NODE_TYPE_NUMBER, NODE_TYPE_STRING } = require("./abparser/ast_node_types");
const exceptions = require("./exceptions");

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
    return expression;
}


module.exports = run;
