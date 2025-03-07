const exceptions = require('./exceptions.js');

/** A class used to loop through things like strings or lists */
class StreamWalker {
    constructor(stream) {
        this.stream = stream;
        this.index = 0;
        this.current_element = this.stream[this.index];
        this.length = this.stream.length;
    }

    /**
     * Move forward in the stream by a number of steps. Does not update the
     * current element if doing so would result in an index error.
     */
    forward() {
        let steps = 1;
        if(arguments.length >= 1) steps = arguments[0];

        this.index += steps;
        if(this.index < this.length) {
            this.current_element = this.stream[this.index];
        }
    }

    /** Tells if the end of the stream has been crossed. */
    reached_end() {
        if(this.index < this.length) return false;
        else return true;
    }

    /** Returns the element before the current element */
    get_previous_element() {
        if(this.index < 1) {
            exceptions.raiseException(exceptions.SYNTAX_ERROR,
                `There should be something before ${this.current_element}`);
        }

        return this.stream[this.index - 1];
    }

    /** Returns the element after the current element, or null if the end of the
     * stream has been reached.
     */
    getNextElement() {
        if(this.index >= this.length - 1) {
            return null;
        }

        return this.stream[this.index + 1];
    }
}


module.exports = StreamWalker;
