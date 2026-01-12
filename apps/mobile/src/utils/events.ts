type Listener = () => void;
const listeners: Record<string, Listener[]> = {};

export const EventEmitter = {
    on: (event: string, fn: Listener) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(fn);
        return () => {
            listeners[event] = listeners[event].filter(l => l !== fn);
        };
    },
    emit: (event: string) => {
        if (listeners[event]) {
            listeners[event].forEach(fn => fn());
        }
    }
};
