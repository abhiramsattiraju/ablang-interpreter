// A class for a node of an AST
class Node {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
};

// An instance of this class is assigned to the value of a node.
class Operation {
    constructor(leftOperand, operator) {
        this.leftOperand = leftOperand;
        this.operator = operator;
    }
}


module.exports = {Node, Operation};
