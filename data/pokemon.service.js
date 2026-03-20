/**
 * GraphQL Queries - Fragment 复用和查询组合
 * 这是企业级GraphQL管理的核心实现
 */

// ==================== Fragments ====================
const Fragments = {
  // Pokemon Color Fragment
  PokemonColor: `
    fragment PokemonColorFragment on pokemon_v2_pokemoncolor {
      id
      name
    }
  `,

  // Basic Pokemon Fragment  
  BasicPokemon: `
    fragment BasicPokemonFragment on pokemon_v2_pokemon {
      id
      name
      height
      weight
    }
  `,

  // Ability Effect Fragment
  AbilityEffect: `
    fragment AbilityEffectFragment on pokemon_v2_abilityeffecttext {
      effect
      short_effect
    }
  `,

  // Pokemon Ability Fragment (组合AbilityEffect)
  PokemonAbility: `
    fragment PokemonAbilityFragment on pokemon_v2_pokemonability {
      id
      slot
      is_hidden
      pokemon_v2_ability {
        id
        name
        pokemon_v2_abilityeffecttexts(where: {language_id: {_eq: 9}}, limit: 1) {
          ...AbilityEffectFragment
        }
      }
    }
  `,

  // Pokemon Type Fragment
  PokemonType: `
    fragment PokemonTypeFragment on pokemon_v2_pokemontype {
      slot
      pokemon_v2_type {
        id
        name
      }
    }
  `,
};

// ==================== Queries ====================
const Queries = {
  /**
   * 搜索 Pokemon Species
   * 展示Fragment组合的威力
   */
  searchSpecies: `
    ${Fragments.PokemonColor}
    ${Fragments.BasicPokemon}
    
    query SearchSpecies($searchTerm: String!, $limit: Int!, $offset: Int!) {
      pokemon_v2_pokemonspecies(
        where: {name: {_ilike: $searchTerm}}
        limit: $limit
        offset: $offset
        order_by: {id: asc}
      ) {
        id
        name
        capture_rate
        pokemon_v2_pokemoncolor {
          ...PokemonColorFragment
        }
        pokemon_v2_pokemons(limit: 10, order_by: {id: asc}) {
          ...BasicPokemonFragment
        }
      }
    }
  `,

  /**
   * 获取 Pokemon 详情
   * 展示多层Fragment嵌套
   */
  getPokemonDetail: `
    ${Fragments.PokemonType}
    ${Fragments.AbilityEffect}
    ${Fragments.PokemonAbility}
    
    query GetPokemonDetail($pokemonId: Int!) {
      pokemon_v2_pokemon(where: {id: {_eq: $pokemonId}}) {
        id
        name
        height
        weight
        base_experience
        
        pokemon_v2_pokemontypes(order_by: {slot: asc}) {
          ...PokemonTypeFragment
        }
        
        pokemon_v2_pokemonabilities(order_by: {slot: asc}) {
          ...PokemonAbilityFragment
        }
      }
    }
  `,
};

// ==================== GraphQL Client ====================
class GraphQLClient {
  constructor() {
    this.endpoint = 'https://beta.pokeapi.co/graphql/v1beta';
    this.timeout = 10000;
  }

  async query(queryString, variables) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, this.timeout);

      wx.request({
        url: this.endpoint,
        method: 'POST',
        header: {'Content-Type': 'application/json'},
        data: {query: queryString, variables},
        success: (res) => {
          clearTimeout(timer);
          if (res.statusCode === 200 && res.data.data) {
            resolve(res.data.data);
          } else {
            reject(new Error(res.data.errors?.[0]?.message || 'Query failed'));
          }
        },
        fail: (err) => {
          clearTimeout(timer);
          reject(new Error(err.errMsg || 'Network error'));
        }
      });
    });
  }
}

// ==================== Repository ====================
class PokemonRepository {
  constructor() {
    this.client = new GraphQLClient();
    this.cache = new Map();
  }

  async searchSpecies(searchTerm, limit = 10, offset = 0) {
    const cacheKey = `search:${searchTerm}:${limit}:${offset}`;
    
    if (this.cache.has(cacheKey)) {
      console.log('✅ Cache hit:', cacheKey);
      return this.cache.get(cacheKey);
    }

    const variables = {
      searchTerm: `%${searchTerm.toLowerCase()}%`,
      limit,
      offset
    };

    const data = await this.client.query(Queries.searchSpecies, variables);
    
    const result = {
      species: data.pokemon_v2_pokemonspecies || [],
      hasMore: (data.pokemon_v2_pokemonspecies || []).length === limit
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  async getPokemonById(pokemonId) {
    const cacheKey = `pokemon:${pokemonId}`;
    
    if (this.cache.has(cacheKey)) {
      console.log('✅ Cache hit:', cacheKey);
      return this.cache.get(cacheKey);
    }

    const data = await this.client.query(Queries.getPokemonDetail, {pokemonId});
    
    if (!data.pokemon_v2_pokemon || data.pokemon_v2_pokemon.length === 0) {
      throw new Error('Pokemon not found');
    }

    const pokemon = data.pokemon_v2_pokemon[0];
    this.cache.set(cacheKey, pokemon);
    return pokemon;
  }
}

// ==================== Service ====================
class PokemonService {
  constructor() {
    this.repository = new PokemonRepository();
  }

  async search(searchTerm, page = 1, pageSize = 8) {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new Error('Search term is required');
    }

    const offset = (page - 1) * pageSize;
    return await this.repository.searchSpecies(searchTerm, pageSize, offset);
  }

  async getDetail(pokemonId) {
    if (!pokemonId || pokemonId < 1) {
      throw new Error('Invalid Pokemon ID');
    }

    return await this.repository.getPokemonById(pokemonId);
  }
}

// ==================== Export ====================
module.exports = {
  PokemonService,
  PokemonRepository,
  GraphQLClient,
  Fragments,
  Queries
};
