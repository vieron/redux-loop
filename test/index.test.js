import test from 'tape';
import { install, runEffect, catchEffects, Effects } from '../modules';
import { effectToPromise } from '../modules/effects';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';

const finalCreateStore = install()(createStore);

test('a looped action gets dispatched after the action that initiated it is reduced', (t) => {
  t.plan(2);

  const firstAction = { type: 'FIRST_ACTION' };
  const secondAction = { type: 'SECOND_ACTION' };
  const thirdAction = (value) => ({ type: 'THIRD_ACTION', payload: value });

  const initialState = {
    prop1: {
      firstRun: false,
      secondRun: false,
      thirdRun: false,
    },
    prop2: true,
  };

  const doThirdLater = (value) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(thirdAction(value));
      }, 0);
    });
  }

  const prop1Reducer = (state = initialState.prop1, action) => {
    switch(action.type) {

    case 'FIRST_ACTION':
      runEffect(
        Effects.batch([
          Effects.constant(secondAction),
          Effects.none(),
        ])
      );

      runEffect(
        Effects.promise(doThirdLater, 'hello')
      );

      return { ...state, firstRun: true };

    case 'SECOND_ACTION':
      return { ...state, secondRun: true };

    case 'THIRD_ACTION':
      return { ...state, thirdRun: action.payload };

    default:
      return state;
    }
  }

  const prop2Reducer = (state = initialState.prop2, action) => state;

  const finalReducer = combineReducers({
    prop1: prop1Reducer,
    prop2: prop2Reducer,
  });

  const store = finalCreateStore(finalReducer, initialState);

  const dispatchPromise = store.dispatch(firstAction);
  t.deepEqual(store.getState(), {
    prop1: {
      firstRun: true,
      secondRun: false,
      thirdRun: false,
    },
    prop2: true,
  });

  dispatchPromise
    .then(() => {
      t.deepEqual(store.getState(), {
        prop1: {
          firstRun: true,
          secondRun: true,
          thirdRun: 'hello',
        },
        prop2: true,
      });
    });
});

test('Effects.lift', (t) => {
  const lowerAction = (name) => ({ type: 'LOWER', name });
  const upperAction = (arg, action) => ({ type: 'UPPER', arg, action });

  const lowerEffect = Effects.constant(lowerAction('hello'));
  const upperEffect = Effects.lift(lowerEffect, upperAction, 1);

  effectToPromise(upperEffect)
    .then(([action]) => {
      t.deepEqual(action, {
        type: 'UPPER',
        arg: 1,
        action: {
          type: 'LOWER',
          name: 'hello'
        },
      });
      t.end();
    });
});
