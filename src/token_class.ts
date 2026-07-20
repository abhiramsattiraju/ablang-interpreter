export class Token {
    type: number;
    value: string | number;

    constructor(type: number, value: string | number) {
        this.type = type;
        this.value = value;
    }
}
