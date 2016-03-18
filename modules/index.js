import {
  runEffect,
  catchEffects,
} from './collection';

import {
  batch,
  none,
  constant,
  promise,
  lift,
} from './effects';

import {
  install,
} from './install';


const Effects = {
  constant,
  promise,
  batch,
  none,
  lift,
};

export {
  Effects,
  install,
  runEffect,
  catchEffects,
};
