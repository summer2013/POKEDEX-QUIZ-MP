const { getCardStyle, formatHeight, formatWeight, formatPokemonId } = require('../../utils/formatters');
const { handleError } = require('../../utils/error-handler');
const LoadingMixin = require('../../mixins/loading.mixin');

const { data: loadingData, ...loadingMethods } = LoadingMixin;

Page(
  Object.assign({}, loadingMethods, {
    data: Object.assign({}, loadingData, {
      pokemon: null,
      loading: true,
      loadingText: 'Loading...',
      pokemonId: '',
      heroStyle: '',
    }),

    pokemonService: null,

    onLoad(options) {
      const app = getApp();
      this.pokemonService = app.getService('pokemonService');

      const { id } = options;
      if (id) {
        this.setData({ pokemonId: formatPokemonId(parseInt(id, 10)) });
        this.loadPokemonDetail(parseInt(id, 10));
      } else {
        this.setData({ loading: false });
      }
    },

    async loadPokemonDetail(id) {
      try {
        await this.withLoading(async () => {
          const pokemon = await this.pokemonService.getDetail(id);

          const formattedPokemon = {
            id: pokemon.id,
            name: pokemon.name,
            height: formatHeight(pokemon.height),
            weight: formatWeight(pokemon.weight),
            baseExperience: pokemon.base_experience,

            types: (pokemon.pokemon_v2_pokemontypes || [])
              .filter((pt) => pt.pokemon_v2_type)
              .map((pt) => ({
                id: pt.pokemon_v2_type.id,
                name: pt.pokemon_v2_type.name,
                slot: pt.slot,
              })),

            abilities: (pokemon.pokemon_v2_pokemonabilities || [])
              .filter((pa) => pa.pokemon_v2_ability)
              .map((pa) => ({
                id: pa.pokemon_v2_ability.id,
                name: pa.pokemon_v2_ability.name,
                slot: pa.slot,
                isHidden: pa.is_hidden,
                effect:
                  pa.pokemon_v2_ability.pokemon_v2_abilityeffecttexts?.[0]?.short_effect ||
                  pa.pokemon_v2_ability.pokemon_v2_abilityeffecttexts?.[0]?.effect,
              })),
          };

          const colorName = pokemon.pokemon_v2_pokemonspecies?.pokemon_v2_pokemoncolor?.name;
          const heroStyle = getCardStyle(colorName);

          this.setData({
            pokemon: formattedPokemon,
            heroStyle,
          });

          wx.setNavigationBarTitle({
            title: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
          });

          wx.vibrateShort({ type: 'light' });
        }, 'Loading...');
      } catch (error) {
        handleError(error, 'DetailPage.loadPokemonDetail');
      }
    },

    goBack() {
      wx.vibrateShort({ type: 'light' });
      wx.navigateBack({
        fail: () => {
          wx.redirectTo({ url: '/pages/search/index' });
        },
      });
    },

    onShareAppMessage() {
      const { pokemon } = this.data;
      return {
        title: `${pokemon?.name || 'Pokémon'} - Hilton Pokédex`,
        path: `/pages/detail/index?id=${pokemon?.id}`,
      };
    },
  })
);
