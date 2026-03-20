Component({
  properties: {
    page: {
      type: Number,
      value: 1,
    },
    totalPages: {
      type: Number,
      value: 0,
    },
    hasMore: {
      type: Boolean,
      value: false,
    },
  },

  methods: {
    handlePrev() {
      if (this.data.page > 1) {
        this.triggerEvent('prev', { page: this.data.page - 1 });
      }
    },

    handleNext() {
      if (this.data.hasMore) {
        this.triggerEvent('next', { page: this.data.page + 1 });
      }
    },
  },
});
