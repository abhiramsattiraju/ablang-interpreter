// A class for a node of an AST
class Node {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
};

/** An instance of this class is assigned to array elements in an expression
  * node's value array.
 **/
class Operation {
    constructor(leftOperand, operator, rightOperand) {
        this.leftOperand = leftOperand;
        this.operator = operator;
        this.rightOperand = rightOperand;
    }
}


module.exports = {Node, Operation};
