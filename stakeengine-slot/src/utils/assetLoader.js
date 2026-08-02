export const loadAsset = (path) => {
  return `/${path}`;
};

export const loadSymbol = (symbolKey, symbolMap) => {
  return loadAsset(symbolMap[symbolKey]);
};

export const loadUI = (uiKey, uiConfig) => {
  return loadAsset(uiConfig.ui[uiKey]);
};

export const loadSound = (soundKey, soundConfig) => {
  return loadAsset(soundConfig.sounds[soundKey]);
};
