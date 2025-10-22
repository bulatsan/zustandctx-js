import {
  type ReactNode,
  createContext as createReactContext,
  useContext,
  useRef,
} from 'react';
import {
  type StateCreator,
  type StoreApi,
  type UseBoundStore,
  create,
} from 'zustand';

type Store<S> = UseBoundStore<StoreApi<S>>;
type Selector<S, R> = (state: S) => R;

export function createContext<S>() {
  const context = createReactContext<Store<S> | undefined>(undefined);

  type ProviderProps = {
    children: ReactNode;
    creator: StateCreator<S>;
  };

  return {
    Provider({ children, creator }: ProviderProps) {
      const ref = useRef<Store<S> | undefined>(undefined);
      if (!ref.current) {
        ref.current = create<S>(creator);
      }
      return (
        <context.Provider value={ref.current}>{children}</context.Provider>
      );
    },
    useStore<R>(selector: Selector<S, R> | undefined): S | R {
      const store = useContext(context);
      if (!store) {
        throw new Error('Store not found');
      }

      if (!selector) {
        return store();
      }

      return store(selector);
    },
  };
}
