const loadingData = {
  loading: false,
  loadingText: 'Loading...',
};

const loadingMethods = {
  showLoading(text = 'Loading...') {
    this.setData({ loading: true, loadingText: text });
  },

  hideLoading() {
    this.setData({ loading: false });
  },

  async withLoading(fn, loadingText = 'Loading...') {
    try {
      this.showLoading(loadingText);
      return await fn();
    } finally {
      this.hideLoading();
    }
  },
};

module.exports = {
  data: loadingData,
  ...loadingMethods,
};
