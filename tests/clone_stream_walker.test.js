const StreamWalker = require('../stream_walker.js');
const { cloneStreamWalker } = require('../clone_stream_walker.js');

describe('StreamWalker Clone Tests', () => {
    it('Should clone walker correctly', () => {
        const original = new StreamWalker([1, 2, 3]);
        original.forward();
        
        const clone = cloneStreamWalker(original);
        expect(clone.currentElement).toBe(original.currentElement);
        expect(clone.index).toBe(original.index);
        expect(clone.length).toBe(original.length);
        expect(clone.stream).toEqual(original.stream);
    });

    it('Should create independent clone', () => {
        const original = new StreamWalker([1, 2, 3]);
        const clone = cloneStreamWalker(original);
        
        clone.forward();
        expect(clone.currentElement).toBe(2);
        expect(original.currentElement).toBe(1);
    });

    it('Should handle null currentElement in clone', () => {
        const original = new StreamWalker([1]);
        original.forward();
        expect(original.currentElement).toBe(null);
        
        const clone = cloneStreamWalker(original);
        expect(clone.currentElement).toBe(null);
    });
});
