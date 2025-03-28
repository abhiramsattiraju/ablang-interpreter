const StreamWalker = require('./stream_walker.js');

function cloneStreamWalker(streamWalker) {
    const newWalker = new StreamWalker(streamWalker.stream);
    newWalker.index = streamWalker.index;
    newWalker.currentElement = streamWalker.currentElement;
    newWalker.length = streamWalker.length;

    return newWalker;
}

module.exports = {
    cloneStreamWalker: cloneStreamWalker
};
