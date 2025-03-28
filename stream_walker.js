const exceptions = require('./exceptions.js');

/** A class used to loop through things like strings or lists
 *  If currentElement is null, it means that the end of the stream has
 * been reached.
*/
class StreamWalker {
    constructor(stream) {
        this.stream = stream;
        this.index = 0;
        this.currentElement = this.stream[this.index];
        this.length = this.stream.length;
    }

    /**
     * Move forward in the stream by a number of steps. Does not update the
     * current element if doing so would result in an index error.
     */
    forward() {
        if(this.currentElement === null) {
            exceptions.raiseException(
                exceptions.REPORT_THIS_BUG,
                `A stream walker cannot move forward when it has reached its \
end.`
            );
        }

        let steps = 1;
        if(arguments.length >= 1) steps = arguments[0];

        this.index += steps;
        if(this.index < this.length) {
            this.currentElement = this.stream[this.index];
        } else {
            this.currentElement = null;
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
                `There should be something before ${this.currentElement}`);
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

    /**
     * Inserts an element at the current index. Does not move the stream
     * forward.
     */
    insertAtCurrentIndex(element) {
        this.insertAtGivenIndex(this.index, element);
    }

    /**
     * Inserts an element at a given index. Does not move the stream
     * forward.
     */
    insertAtGivenIndex(index, element) {
        if(index < 0 || index > this.length) {
            exceptions.raiseException(
                exceptions.REPORT_THIS_BUG,
                `A stream walker cannot insert an element at index ${index} \
                when it has length ${this.length}.`
            );
        }

        this.stream.splice(index, 0, element);
        this.length++;
    }
}


module.exports = StreamWalker;
