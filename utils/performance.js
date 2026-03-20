function debounce(fn, delay = 300) {
  let timer = null;
  return function debounced(...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, delay);
  };
}

function throttle(fn, interval = 300) {
  let lastTime = 0;
  return function throttled(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

const vibrateLight = debounce(() => {
  wx.vibrateShort({ type: 'light' });
}, 100);

const vibrateHeavy = throttle(() => {
  wx.vibrateShort({ type: 'heavy' });
}, 200);

module.exports = {
  debounce,
  throttle,
  vibrateLight,
  vibrateHeavy,
};
