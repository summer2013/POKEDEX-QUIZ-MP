/**
 * 详情页面
 * 展示Repository模式和Service层的使用
 */

const { PokemonService } = require('../../data/pokemon.service');
const { getCardStyle, formatHeight, formatWeight, formatPokemonId } = require('../../utils/formatters');

Page({
  data: {
    pokemon: null,
    loading: true,
    pokemonId: '',
    heroStyle: '',
  },

  pokemonService: null,

  onLoad(options) {
    this.pokemonService = new PokemonService();
    
    const { id, name } = options;
    if (id) {
      this.setData({ pokemonId: formatPokemonId(parseInt(id)) });
      this.loadPokemonDetail(parseInt(id));
    }
  },

  async loadPokemonDetail(id) {
    this.setData({ loading: true });

    try {
      const pokemon = await this.pokemonService.getDetail(id);

      // 格式化数据
      const formattedPokemon = {
        id: pokemon.id,
        name: pokemon.name,
        height: formatHeight(pokemon.height),
        weight: formatWeight(pokemon.weight),
        baseExperience: pokemon.base_experience,
        // captureRate: pokemon.pokemon_v2_pokemonspecies?.capture_rate,
        
        types: (pokemon.pokemon_v2_pokemontypes || []).map(pt => ({
          id: pt.pokemon_v2_type.id,
          name: pt.pokemon_v2_type.name,
          slot: pt.slot
        })),
        
        abilities: (pokemon.pokemon_v2_pokemonabilities || []).map(pa => ({
          id: pa.pokemon_v2_ability.id,
          name: pa.pokemon_v2_ability.name,
          slot: pa.slot,
          isHidden: pa.is_hidden,
          effect: pa.pokemon_v2_ability.pokemon_v2_abilityeffecttexts?.[0]?.short_effect ||
                  pa.pokemon_v2_ability.pokemon_v2_abilityeffecttexts?.[0]?.effect
        }))

      };

      // 设置Hero样式
      const colorName = pokemon.pokemon_v2_pokemonspecies?.pokemon_v2_pokemoncolor?.name;
      const heroStyle = getCardStyle(colorName);

      this.setData({
        pokemon: formattedPokemon,
        heroStyle,
        loading: false
      });

      // 更新标题
      wx.setNavigationBarTitle({
        title: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
      });

      wx.vibrateShort({ type: 'light' });

    } catch (error) {
      console.error('Load detail error:', error);
      wx.showToast({
        title: error.message || 'Failed to load',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  goBack() {
    wx.vibrateShort({ type: 'light' });
    wx.navigateBack({
      fail: () => {
        wx.redirectTo({ url: '/pages/search/index' });
      }
    });
  },

  onShareAppMessage() {
    const { pokemon } = this.data;
    return {
      title: `${pokemon?.name || 'Pokémon'} - Hilton Pokédex`,
      path: `/pages/detail/index?id=${pokemon?.id}`
    };
  }
});
