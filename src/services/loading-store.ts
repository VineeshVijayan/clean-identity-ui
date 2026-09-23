type LoadingListener = (pendingCount: number) => void;

let pendingCount = 0;
const listeners = new Set<LoadingListener>();

const notify = () => {
  listeners.forEach((listener) => listener(pendingCount));
};

export const loadingStore = {
  subscribe(listener: LoadingListener) {
    listeners.add(listener);
    listener(pendingCount);
    return () => {
      listeners.delete(listener);
    };
  },

  start() {
    pendingCount += 1;
    notify();
  },

  end() {
    pendingCount = Math.max(0, pendingCount - 1);
    notify();
  },

  getCount() {
    return pendingCount;
  },
};
