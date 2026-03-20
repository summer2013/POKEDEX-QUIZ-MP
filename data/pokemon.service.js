// data/pokemon.service.js
const request = require('../utils/request');

const Fragments = {
  PokemonColor: `
    fragment PokemonColorFragment on pokemon_v2_pokemoncolor {
      id
      name
    }
  `,

  BasicPokemon: `
    fragment BasicPokemonFragment on pokemon_v2_pokemon {
      id
      name
      height
      weight
    }
  `,

  AbilityEffect: `
    fragment AbilityEffectFragment on pokemon_v2_abilityeffecttext {
      effect
      short_effect
    }
  `,

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

const Queries = {
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

      pokemon_v2_pokemonspecies_aggregate(
        where: {name: {_ilike: $searchTerm}}
      ) {
        aggregate {
          count
        }
      }
    }
  `,

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


class GraphQLClient {
  constructor() {
    this.endpoint = 'https://beta.pokeapi.co/graphql/v1beta';
  }

  async query(queryString, variables) {
    const body = await request.post(this.endpoint, {
      query: queryString,
      variables,
    });

    if (body.errors && body.errors.length) {
      throw new Error(body.errors[0].message || 'GraphQL error');
    }
    if (body.data == null) {
      throw new Error('Invalid GraphQL response');
    }

    return body.data;
  }
}

const MAX_CACHE_SIZE = 200;

class PokemonRepository {
  constructor() {
    this.client = new GraphQLClient();
    this.cache = new Map();
    this.maxCacheSize = MAX_CACHE_SIZE;
  }

  getCache(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  setCache(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    this.cache.set(key, value);

    if (this.cache.size > this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
  }

  async searchSpecies(searchTerm, limit = 10, offset = 0) {
    const cacheKey = `search:${searchTerm}:${limit}:${offset}`;
    
    const cached = this.getCache(cacheKey);
    if (cached) {
      return cached;
    }

    const variables = {
      searchTerm: `%${searchTerm.toLowerCase()}%`,
      limit,
      offset
    };

    const data = await this.client.query(Queries.searchSpecies, variables);
    
    const species = data.pokemon_v2_pokemonspecies || [];
    const total = data.pokemon_v2_pokemonspecies_aggregate?.aggregate?.count || 0;
    const result = {
      species,
      total,
      hasMore: offset + species.length < total,
    };

    this.setCache(cacheKey, result);
    return result;
  }

  async getPokemonById(pokemonId) {
    const cacheKey = `pokemon:${pokemonId}`;
    
    const cached = this.getCache(cacheKey);
    if (cached) {
      return cached;
    }

    const data = await this.client.query(Queries.getPokemonDetail, {pokemonId});
    
    if (!data.pokemon_v2_pokemon || data.pokemon_v2_pokemon.length === 0) {
      throw new Error('Pokemon not found');
    }

    const pokemon = data.pokemon_v2_pokemon[0];
    this.setCache(cacheKey, pokemon);
    return pokemon;
  }
}

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

module.exports = {
  PokemonService,
  PokemonRepository,
  GraphQLClient,
  Fragments,
  Queries
};
