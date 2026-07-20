import { StreamWalker } from "../src/stream_walker";

describe("StreamWalker Tests", () => {
    it("Should initialize correctly", () => {
        const walker = new StreamWalker<number>([1, 2, 3]);
        expect(walker.currentElement).toBe(1);
        expect(walker.index).toBe(0);
        expect(walker.length).toBe(3);
    });

    it("Should move forward correctly", () => {
        const walker = new StreamWalker<number>([1, 2, 3]);

        walker.forward();
        expect(walker.currentElement).toBe(2);
        expect(walker.index).toBe(1);

        walker.forward(2);
        expect(walker.currentElement).toBe(null);

        const walker2 = new StreamWalker<number>([1, 2, 3, 4, 5, 6]);
        walker2.forward(3);
        expect(walker2.currentElement).toBe(4);
        expect(walker2.index).toBe(3);
    });

    it("Should handle reached_end correctly", () => {
        const walker = new StreamWalker<number>([1, 2]);

        expect(walker.reached_end()).toBe(false);

        walker.forward();
        expect(walker.reached_end()).toBe(false);

        walker.forward();
        expect(walker.reached_end()).toBe(true);
    });

    it("Should get previous element correctly", () => {
        const walker = new StreamWalker<number>([1, 2, 3]);
        walker.forward();
        expect(walker.get_previous_element()).toBe(1);
    });

    it("Should throw error when no previous element exists", () => {
        const walker = new StreamWalker<number>([1, 2, 3]);
        expect(() => walker.get_previous_element()).toThrow();
    });

    it("Should get next element correctly", () => {
        const walker = new StreamWalker<number>([1, 2, 3]);
        expect(walker.getNextElement()).toBe(2);
        walker.forward(2);
        expect(walker.getNextElement()).toBe(null);
    });

    it("Should insert at current index correctly", () => {
        const walker = new StreamWalker<number>([1, 2, 3]);
        walker.forward();
        walker.insertAtCurrentIndex(4);
        expect(walker.stream).toEqual([1, 4, 2, 3]);
        expect(walker.length).toBe(4);
        expect(walker.index).toBe(1);
        expect(walker.currentElement).toBe(4);
    });

    it("Should insert at given index correctly", () => {
        const walker = new StreamWalker<number>([1, 2, 3]);
        walker.forward();
        walker.insertAtGivenIndex(0, 5);
        expect(walker.stream).toEqual([5, 1, 2, 3]);
        expect(walker.length).toBe(4);
        expect(walker.index).toBe(1);
        expect(walker.currentElement).toBe(1);
    });
});
