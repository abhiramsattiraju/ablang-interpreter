// A class for a node of an AST
class Node {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
};

// An instance of this class is assigned as the value of a node.
class Operation {
    constructor(leftOperand, operator, rightOperand) {
        this.leftOperand = leftOperand;
        this.operator = operator;
        this.rightOperand = rightOperand;
    }
}


module.exports = {Node, Operation};
