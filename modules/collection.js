let currentEffectHandler = null;

export const runEffect = (effect) => {
  if(currentEffectHandler) {
    currentEffectHandler(effect);
  }
};

export const catchEffects = (fn, handler) => {
  const previousHandler = currentEffectHandler;
  currentEffectHandler = handler;
  const val = fn();
  currentEffectHandler = previousHandler;
  return val;
};
