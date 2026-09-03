import { Ref, Effect } from 'effect';

// Constants
import {
  ERROR_MESSAGES,
  TOP_UP_AMOUNTS,
  TOP_UP_MAX_AMOUNT,
  TOP_UP_MIN_AMOUNT,
} from '@/constants';
import { formatIDR } from '@/utils/formats';
import { useCallback, useEffect, useState } from 'react';

class TopUpState {
  getState: Effect.Effect<{
    amount: string;
    selectedAmount: number | null;
    error: string;
    parsedAmount: number;
  }>;
  reset: Effect.Effect<void>;
  setAmount: (text: string) => Effect.Effect<void>;
  selectAmount: (value: number) => Effect.Effect<void>;

  constructor(
    private amountRef: Ref.Ref<string>,
    private selectedAmountRef: Ref.Ref<number | null>,
    private errorRef: Ref.Ref<string>,
  ) {
    // Set amount with validation
    this.setAmount = (text: string) =>
      Effect.gen(function* (_) {
        let cleaned = text.replace(/^IDR\s*/i, '');
        cleaned = cleaned.replace(/[^\d]/g, '');

        if (!cleaned) {
          yield* _(Ref.set(amountRef, ''));
          yield* _(Ref.set(selectedAmountRef, null));
          yield* _(Ref.set(errorRef, ''));
          return;
        }

        const numValue = parseInt(cleaned, 10);
        const matchesPredefined = TOP_UP_AMOUNTS.includes(numValue);

        let error = '';
        if (numValue < TOP_UP_MIN_AMOUNT) {
          error = ERROR_MESSAGES.TOP_UP_MIN_AMOUNT;
        } else if (numValue > TOP_UP_MAX_AMOUNT) {
          error = ERROR_MESSAGES.TOP_UP_MAX_AMOUNT;
        }

        yield* _(Ref.set(amountRef, formatIDR(numValue)));
        yield* _(
          Ref.set(selectedAmountRef, matchesPredefined ? numValue : null),
        );
        yield* _(Ref.set(errorRef, error));
      });

    // Select predefined amount
    this.selectAmount = (value: number) =>
      Effect.gen(function* (_) {
        yield* _(Ref.set(amountRef, formatIDR(value)));
        yield* _(Ref.set(selectedAmountRef, value));
        yield* _(Ref.set(errorRef, ''));
      });

    // Reset all state
    this.reset = Effect.gen(function* (_) {
      yield* _(Ref.set(amountRef, ''));
      yield* _(Ref.set(selectedAmountRef, null));
      yield* _(Ref.set(errorRef, ''));
    });

    // Get current state
    this.getState = Effect.gen(function* (_) {
      const amount = yield* _(Ref.get(amountRef));
      const selectedAmount = yield* _(Ref.get(selectedAmountRef));
      const error = yield* _(Ref.get(errorRef));

      const cleaned = amount.replace(/[^\d]/g, '');
      const parsedAmount = parseInt(cleaned, 10) || 0;

      return { amount, selectedAmount, error, parsedAmount };
    });
  }
}

// Factory function to create TopUpState
const initTopUpState = Effect.gen(function* (_) {
  const amountRef = yield* _(Ref.make(''));
  const selectedAmountRef = yield* _(Ref.make<number | null>(null));
  const errorRef = yield* _(Ref.make(''));

  return new TopUpState(amountRef, selectedAmountRef, errorRef);
});

// Custom hook to use TopUpState
export const useTopUpEffect = () => {
  const [topUpState] = useState(() => Effect.runSync(initTopUpState));
  const [state, setState] = useState({
    amount: '',
    selectedAmount: null as number | null,
    error: '',
    parsedAmount: 0,
  });

  // Sync state on mount
  useEffect(() => {
    Effect.runPromise(topUpState.getState).then(setState);
  }, [topUpState]);

  const setAmount = useCallback(
    (text: string) => {
      Effect.runPromise(
        Effect.gen(function* (_) {
          yield* _(topUpState.setAmount(text));
          return yield* _(topUpState.getState);
        }),
      ).then(setState);
    },
    [topUpState],
  );

  const selectAmount = useCallback(
    (value: number) => {
      Effect.runPromise(
        Effect.gen(function* (_) {
          yield* _(topUpState.selectAmount(value));
          return yield* _(topUpState.getState);
        }),
      ).then(setState);
    },
    [topUpState],
  );

  const reset = useCallback(() => {
    Effect.runPromise(
      Effect.gen(function* (_) {
        yield* _(topUpState.reset);
        return yield* _(topUpState.getState);
      }),
    ).then(setState);
  }, [topUpState]);

  return {
    state,
    setAmount,
    selectAmount,
    reset,
  };
};
