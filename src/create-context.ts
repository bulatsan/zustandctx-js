import {
  createElement,
  createContext as reactCreateContext,
  useContext,
  useRef,
} from 'react';
import { type StoreApi, useStore as useZustandStore } from 'zustand';

export const createContext = <
  State,
  Store extends StoreApi<State> = StoreApi<State>,
>() => {
  const StoreContext = reactCreateContext<Store | undefined>(undefined);

  type Provider = React.FC<
    {
      createStore: () => Store;
      children: React.ReactNode;
    } & Record<string, unknown>
  >;

  const Provider: Provider = ({ createStore, ...rest }) => {
    const storeRef = useRef<Store>();
    return createElement(StoreContext.Provider, {
      value: (storeRef.current ||= createStore()),
      ...rest,
    });
  };

  const useStore = <StateSlice = ExtractState<Store>>(
    selector: (state: ExtractState<Store>) => StateSlice,
  ) => {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error('Store not found');
    }
    return useZustandStore(store, selector);
  };

  return [Provider, useStore] as const;
};

type ExtractState<Store> = Store extends { getState: () => infer T }
  ? T
  : never;
