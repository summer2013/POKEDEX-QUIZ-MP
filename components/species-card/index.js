Component({
  properties: {
    species: {
      type: Object,
      value: null,
    },
    index: {
      type: Number,
      value: 0,
    },
  },

  data: {
    cardStyle: '',
  },

  observers: {
    'species, index': function () {
      const s = this.data.species;
      const idx = typeof this.data.index === 'number' ? this.data.index : 0;
      const delay = Math.min(idx, 7) * 50;
      this.setData({
        cardStyle: s && s.style ? `${s.style}; animation-delay: ${delay}ms` : '',
      });
    },
  },

  methods: {
    onVarietyTap(e) {
      const { id, name } = e.currentTarget.dataset;
      this.triggerEvent('varietytap', { id, name });
    },
  },
});
