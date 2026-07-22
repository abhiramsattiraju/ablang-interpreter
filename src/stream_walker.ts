import * as exceptions from "./exceptions";

export class StreamWalker<T> {
    stream: T[] | string;
    index: number;
    currentElement: T | null;
    length: number;

    constructor(stream: T[] | string) {
        this.stream = stream;
        this.index = 0;
        this.currentElement = stream.length > 0 ? (stream[0] as unknown as T) : null;
        this.length = stream.length;
    }

    forward(steps: number = 1): void {
        if (this.currentElement === null) {
            exceptions.raiseException(
                exceptions.REPORT_THIS_BUG,
                "A stream walker cannot move forward when it has reached its end."
            );
        }

        this.index += steps;
        if (this.index < this.length) {
            this.currentElement = this.stream[this.index] as unknown as T;
        } else {
            this.currentElement = null;
        }
    }

    reached_end(): boolean {
        return this.index >= this.length;
    }

    get_previous_element(): T {
        if (this.index < 1) {
            exceptions.raiseException(
                exceptions.SYNTAX_ERROR,
                `There should be something before ${this.currentElement}`
            );
        }
        return this.stream[this.index - 1] as unknown as T;
    }

    getNextElement(): T | null {
        if (this.index >= this.length - 1) {
            return null;
        }
        return this.stream[this.index + 1] as unknown as T;
    }

    insertAtCurrentIndex(element: T): void {
        this.insertAtGivenIndex(this.index, element);
    }

    insertAtGivenIndex(index: number, element: T): void {
        if (index < 0 || index > this.length) {
            exceptions.raiseException(
                exceptions.REPORT_THIS_BUG,
                `A stream walker cannot insert an element at index ${index} when it has length ${this.length}.`
            );
        }

        if (typeof this.stream === 'string') {
            exceptions.raiseException(
                exceptions.REPORT_THIS_BUG,
                "A stream walker cannot insert an element into a string stream."
            );
        }

        (this.stream as T[]).splice(index, 0, element);
        this.length++;
        this.currentElement = this.stream[this.index] as unknown as T;
    }
}
