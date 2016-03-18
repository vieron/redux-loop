import { throwInvariant } from './utils';
import { loopPromiseCaughtError } from './errors';
import { catchEffects } from './collection';
import { effectToPromise } from './effects';

/**
 * Installs a new dispatch function which will attempt to execute any effects
 * attached to the current model as established by the original dispatch.
 */
export function install() {
  return (next) => (reducer, initialState) => {
    let effects = [];

    const liftReducer = (r) => (state, action) => {
      return catchEffects(
        () => r(state, action),
        (effect) => effects.push(effect)
      );
    };

    const store = next(liftReducer(reducer), initialState);

    const replaceReducer = (r) => {
      return store.replaceReducer(liftReducer(r));
    };

    const dispatch = (action) => {
      store.dispatch(action);
      return execute(action).then(() => {});
    };

    const execute = (originalAction) => {
      const currentEffects = effects;
      effects = [];
      return Promise.all(
        currentEffects.map((effect) => {
          return effectToPromise(effect)
            .then((actions) => Promise.all(actions.map(dispatch)))
            .catch((error) => {
              console.error(loopPromiseCaughtError(originalAction.type));
              throw error;
            });
        })
      );
    };

    return {
      ...store,
      dispatch,
      replaceReducer,
    };
  };
}
