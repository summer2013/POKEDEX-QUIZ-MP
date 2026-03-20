const { getCardStyle, getCaptureRatePercent } = require('../../utils/formatters');
const PaginationMixin = require('../../mixins/pagination.mixin');
const LoadingMixin = require('../../mixins/loading.mixin');
const { debounce, vibrateLight } = require('../../utils/performance');
const { handleError } = require('../../utils/error-handler');

const { data: paginationData, ...paginationMethods } = PaginationMixin;
const { data: loadingData, ...loadingMethods } = LoadingMixin;

Page(
  Object.assign({}, paginationMethods, loadingMethods, {
    data: Object.assign({}, paginationData, loadingData, {
      showWelcome: false,
      searchTerm: '',
      results: [],
      searched: false,
      total: 0,
      totalPages: 0,
    }),

    pokemonService: null,

    onLoad() {
      const app = getApp();
      this.pokemonService = app.getService('pokemonService');
      this.initPagination(8);

      this.debouncedSearch = debounce(() => {
        if (this.data.searchTerm) {
          this.performSearch();
        }
      }, 600);

      if (app.globalData.isFirstLaunch) {
        this.setData({ showWelcome: true });
        app.globalData.isFirstLaunch = false;
      }
    },

    onPageChange() {
      this.performSearch();
    },

    onPaginationPrev(e) {
      const next = e.detail && e.detail.page;
      if (typeof next === 'number' && next >= 1) {
        this.setData({ page: next }, () => this.performSearch());
      }
    },

    onPaginationNext(e) {
      const next = e.detail && e.detail.page;
      if (typeof next === 'number') {
        this.setData({ page: next }, () => this.performSearch());
      }
    },

    hideWelcome() {
      this.setData({ showWelcome: false });
      vibrateLight();
    },

    stopPropagation() {},

    onSearchInput(e) {
      const value = e.detail.value.trim();
      if (!value) {
        this.setData({
          searchTerm: '',
          results: [],
          searched: false,
          totalPages: 0,
          page: 1,
          hasMore: false,
        });
        return;
      }
      this.setData({
        searchTerm: value,
        page: 1,
        hasMore: false,
        totalPages: 0,
      });
      this.debouncedSearch();
    },

    onSearch() {
      if (this.data.searchTerm) {
        this.setData({ page: 1, hasMore: false, totalPages: 0 }, () => {
          this.performSearch();
        });
      }
    },

    async performSearch() {
      const { searchTerm, page, pageSize } = this.data;

      if (!searchTerm) return;

      try {
        await this.withLoading(async () => {
          const result = await this.pokemonService.search(searchTerm, page, pageSize);

          const formattedResults = result.species.map((species) => ({
            id: species.id,
            name: species.name,
            capture_rate: species.capture_rate,
            ratePercent: getCaptureRatePercent(species.capture_rate),
            pokemons: (species.pokemon_v2_pokemons || []).map((p) => ({
              id: p.id,
              name: p.name,
            })),
            style: getCardStyle(species.pokemon_v2_pokemoncolor?.name),
          }));

          const total = result.total || 0;
          const totalPages = Math.ceil(total / pageSize);

          this.setData({
            results: formattedResults,
            hasMore: result.hasMore,
            searched: true,
            total,
            totalPages,
          });

          vibrateLight();
        }, 'Searching...');
      } catch (error) {
        handleError(error, 'SearchPage.performSearch');
        this.setData({
          searched: true,
          results: [],
          hasMore: false,
          total: 0,
          totalPages: 0,
        });
      }
    },

    navigateToPokemon(id, name) {
      vibrateLight();
      const q = `id=${encodeURIComponent(String(id))}`;
      const n =
        name != null && String(name).length > 0
          ? `&name=${encodeURIComponent(String(name))}`
          : '';
      wx.navigateTo({
        url: `/pages/detail/index?${q}${n}`,
      });
    },

    onSpeciesVarietyTap(e) {
      const { id, name } = e.detail;
      this.navigateToPokemon(id, name);
    },

    onShareAppMessage() {
      return {
        title: 'Hilton Pokédex - Discover Pokémon',
        path: '/pages/search/index',
      };
    },
  })
);
