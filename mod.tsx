import {
  atom,
  useSetAtom,
  useAtomValue,
  Provider as JotaiProvider,
} from "jotai";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import * as uuid from "uuid";
import _ from "lodash";

function nextId() {
  return uuid.v7();
}

interface CreateRegistrationContextOpts<T> {
  comparatorFunction?<T>(): number;
}

type RegistrationProvider = FC<PropsWithChildren>;
type UseRegisterValue<T> = (value: T) => void;
type UseValues<T> = () => T[];

/** Create a new registration context for the specified type T
 *
 * @example const [MyProvider, useRegisterMyValue, useMyValues] = createRegistrationContext<String>();
 *
 * @example
 * // MyProvider will host the registration context internally
 * // If no provider is present then the component will be global.
 * return <MyProvider><Parent/></MyProvider>;
 *
 * @example
 * // useMyValues will give the parent component access to the value of every child that registers.
 * // If no provider is in the parent this will be global.
 * const values = useMyValues();
 *
 * @example
 * // useRegisterMyValue will make this value available to any component inside the same provider.
 * useRegisterMyValue("Foo");
 */
export function createRegistrationContext<T>(
  opts: CreateRegistrationContextOpts<T> = {}
): [RegistrationProvider, UseRegisterValue<T>, UseValues<T>] {
  type State = { [key: string]: T };

  const stateAtom = atom<State>({});
  const valuesAtom = atom<T[]>((get) =>
    Object.values(get(stateAtom)).sort(opts.comparatorFunction)
  );

  function useRegisterValue(value: T) {
    const [id] = useState(nextId());

    const setState = useSetAtom(stateAtom);

    useEffect(() => {
      setState((prev) => ({ ...prev, [id]: value }));
      return () => {
        setState((prev) => {
          const output = { ...prev };
          delete output[id];
          return output;
        });
      };
    }, [value]);
  }

  function useValues() {
    return useAtomValue(valuesAtom);
  }

  function Provider({ children }: PropsWithChildren) {
    return <JotaiProvider>{children}</JotaiProvider>;
  }

  return [Provider, useRegisterValue, useValues] as const;
}
