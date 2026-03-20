const paginationData = {
  page: 1,
  pageSize: 8,
  hasMore: false,
  total: 0,
};

const paginationMethods = {
  initPagination(pageSize = 8) {
    this.setData({
      page: 1,
      pageSize,
      hasMore: false,
      total: 0,
    });
  },

  prevPage() {
    if (this.data.page > 1) {
      this.setData({ page: this.data.page - 1 }, () => {
        if (typeof this.onPageChange === 'function') {
          this.onPageChange();
        }
      });
    }
  },

  nextPage() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 }, () => {
        if (typeof this.onPageChange === 'function') {
          this.onPageChange();
        }
      });
    }
  },

  goToPage(page) {
    const p = Number(page);
    if (p >= 1 && p !== this.data.page) {
      this.setData({ page: p }, () => {
        if (typeof this.onPageChange === 'function') {
          this.onPageChange();
        }
      });
    }
  },

  updatePaginationState(total, currentCount) {
    this.setData({
      total,
      hasMore: currentCount === this.data.pageSize,
    });
  },

  resetPagination() {
    this.setData({ page: 1, hasMore: false });
  },
};

module.exports = {
  data: paginationData,
  ...paginationMethods,
};
