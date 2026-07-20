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
    operator: any;
    rightOperand: any;

    constructor(leftOperand: any, operator: any, rightOperand: any) {
        this.leftOperand = leftOperand;
        this.operator = operator;
        this.rightOperand = rightOperand;
    }
}
