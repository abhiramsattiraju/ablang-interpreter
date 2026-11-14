export class Node {
    type: number | null;
    value: any;

    constructor(type: number | null = null, value: any = null) {
        this.type = type;
        this.value = value;
    }
}

export class Operation {
    leftOperand: any;
    operator: number;
    rightOperand: any;

    constructor(leftOperand: any, operator: number, rightOperand: any) {
        this.leftOperand = leftOperand;
        this.operator = operator;
        this.rightOperand = rightOperand;
    }
}

export class IfStatement {
    condition: Node;
    body: Node[];

    constructor(condition: Node, body: Node[]) {
        this.condition = condition;
        this.body = body;
    }
}


export class AssignmentStatement {
    name: string;
    expression: Node;

    constructor(name: string, expression: Node) {
        this.name = name;
        this.expression = expression;
    }
}

// A use of a variable inside an expression; resolved at run time.
export class VariableReference {
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}
