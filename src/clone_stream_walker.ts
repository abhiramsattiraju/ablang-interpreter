import { StreamWalker } from "./stream_walker";

export function cloneStreamWalker<T>(streamWalker: StreamWalker<T>): StreamWalker<T> {
    const newWalker = new StreamWalker<T>(streamWalker.stream);
    newWalker.index = streamWalker.index;
    newWalker.currentElement = streamWalker.currentElement;
    newWalker.length = streamWalker.length;

    return newWalker;
}
