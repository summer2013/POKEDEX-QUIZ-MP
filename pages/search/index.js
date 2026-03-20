/**
 * 搜索页面
 * 展示企业级架构：Service层调用、防抖、缓存
 */

const { PokemonService } = require('../../data/pokemon.service');
const { getCardStyle, getCaptureRatePercent } = require('../../utils/formatters');

let searchTimeout = null;
const DEBOUNCE_DELAY = 600;

Page({
  data: {
    showWelcome: false,
    searchTerm: '',
    results: [],
    loading: false,
    searched: false,
    page: 1,
    pageSize: 8,
    hasMore: false,
  },

  pokemonService: null,

  onLoad() {
    // 从IoC容器获取服务（模拟）
    this.pokemonService = new PokemonService();
    
    // 检查首次启动
    const app = getApp();
    if (app.globalData.isFirstLaunch) {
      this.setData({ showWelcome: true });
      app.globalData.isFirstLaunch = false;
    }
  },

  hideWelcome() {
    this.setData({ showWelcome: false });
    wx.vibrateShort({ type: 'light' });
  },

  stopPropagation() {
    // 阻止事件冒泡
  },

  onSearchInput(e) {
    const value = e.detail.value.trim();
    this.setData({ searchTerm: value, page: 1 });

    // 清除之前的定时器
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // 空值清空结果
    if (!value) {
      this.setData({ results: [], searched: false });
      return;
    }

    // 防抖搜索
    searchTimeout = setTimeout(() => {
      this.performSearch();
    }, DEBOUNCE_DELAY);
  },

  onSearch() {
    if (this.data.searchTerm) {
      this.performSearch();
    }
  },

  async performSearch() {
    const { searchTerm, page, pageSize } = this.data;

    if (!searchTerm) return;

    this.setData({ loading: true });

    try {
      const result = await this.pokemonService.search(searchTerm, page, pageSize);

      // 格式化结果
      const formattedResults = result.species.map(species => ({
        id: species.id,
        name: species.name,
        capture_rate: species.capture_rate,
        ratePercent: getCaptureRatePercent(species.capture_rate),
        pokemons: species.pokemon_v2_pokemons.map(p => ({
          id: p.id,
          name: p.name
        })),
        style: getCardStyle(species.pokemon_v2_pokemoncolor?.name)
      }));

      this.setData({
        results: formattedResults,
        hasMore: result.hasMore,
        loading: false,
        searched: true
      });

      wx.vibrateShort({ type: 'light' });

    } catch (error) {
      console.error('Search error:', error);
      wx.showToast({
        title: error.message || 'Search failed',
        icon: 'none'
      });
      this.setData({ loading: false, searched: true });
    }
  },

  goToDetail(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.vibrateShort({ type: 'light' });
    wx.navigateTo({
      url: `/pages/detail/index?id=${id}&name=${name}`
    });
  },

  prevPage() {
    if (this.data.page > 1) {
      this.setData({ page: this.data.page - 1 }, () => {
        this.performSearch();
      });
    }
  },

  nextPage() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 }, () => {
        this.performSearch();
      });
    }
  },

  onShareAppMessage() {
    return {
      title: 'Hilton Pokédex - Discover Pokémon',
      path: '/pages/search/index'
    };
  }
});
