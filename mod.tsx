import {
  Provider as JotaiProvider,
  atom,
  useAtomValue,
  useSetAtom,
} from "jotai";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import uuid from "uuid";
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
        setState((prev) => _.omit(prev, id));
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
