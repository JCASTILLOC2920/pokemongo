document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const pokemonInput = document.getElementById('pokemon-name');
    const autocompleteResults = document.getElementById('autocomplete-results');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultContainer = document.getElementById('result-container');
    const attackIvInput = document.getElementById('attack-iv');
    const defenseIvInput = document.getElementById('defense-iv');
    const hpIvInput = document.getElementById('hp-iv');

    // --- Data ---
    const API_BASE_URL = 'https://pokeapi.co/api/v2/';
    let pokemonList = [];
    const CPM_TABLE = {
        1: 0.094, 1.5: 0.13513743, 2: 0.16639787, 2.5: 0.19265092, 3: 0.21573247, 3.5: 0.23657266, 4: 0.25572005, 4.5: 0.27353038, 5: 0.29024988, 5.5: 0.30605738, 6: 0.3210876, 6.5: 0.33544504, 7: 0.34921268, 7.5: 0.36245775, 8: 0.3752356, 8.5: 0.38759242, 9: 0.39956728, 9.5: 0.41119355, 10: 0.4225, 10.5: 0.4329264, 11: 0.44310755, 11.5: 0.45305996, 12: 0.4627984, 12.5: 0.47233609, 13: 0.48168495, 13.5: 0.4908558, 14: 0.49985844, 14.5: 0.50870177, 15: 0.51739395, 15.5: 0.5259425, 16: 0.5343543, 16.5: 0.54263574, 17: 0.5507927, 17.5: 0.55883059, 18: 0.5667545, 18.5: 0.57456913, 19: 0.5822789, 19.5: 0.5898879, 20: 0.5974, 20.5: 0.60482367, 21: 0.6121573, 21.5: 0.6194041, 22: 0.6265671, 22.5: 0.63364914, 23: 0.64065295, 23.5: 0.64758097, 24: 0.65443563, 24.5: 0.66121925, 25: 0.667934, 25.5: 0.6745819, 26: 0.6811649, 26.5: 0.6876849, 27: 0.69414365, 27.5: 0.70054287, 28: 0.7068842, 28.5: 0.7131691, 29: 0.7193991, 29.5: 0.7255756, 30: 0.7317, 30.5: 0.734741, 31: 0.7377695, 31.5: 0.7407855, 32: 0.74378943, 32.5: 0.7467812, 33: 0.74976104, 33.5: 0.7527296, 34: 0.7556855, 34.5: 0.7586294, 35: 0.76156384, 35.5: 0.76448896, 36: 0.7674049, 36.5: 0.77031225, 37: 0.7732109, 37.5: 0.7761014, 38: 0.77898275, 38.5: 0.7818554, 39: 0.7847189, 39.5: 0.7875741, 40: 0.7903, 40.5: 0.7928039, 41: 0.7953, 41.5: 0.7977836, 42: 0.8002571, 42.5: 0.8027206, 43: 0.8051741, 43.5: 0.8076176, 44: 0.8100511, 44.5: 0.8124746, 45: 0.8148881, 45.5: 0.8172916, 46: 0.8196851, 46.5: 0.8220686, 47: 0.8244421, 47.5: 0.8268056, 48: 0.8291591, 48.5: 0.8315026, 49: 0.8338361, 49.5: 0.8361596, 50: 0.8384731, 51: 0.843001,
    };

    // --- Functions ---

    // Fetch all Pokémon for autocomplete
    async function fetchPokemonList() {
        try {
            const response = await fetch(`${API_BASE_URL}pokemon?limit=1500`);
            const data = await response.json();
            pokemonList = data.results.map(p => p.name);
        } catch (error) {
            console.error("Error fetching Pokémon list:", error);
        }
    }

    // Handle Autocomplete
    function showAutocomplete(input) {
        autocompleteResults.innerHTML = '';
        if (input.length === 0) return;

        const filteredList = pokemonList.filter(p => p.startsWith(input.toLowerCase()));
        filteredList.slice(0, 5).forEach(pokemonName => {
            const div = document.createElement('div');
            div.textContent = pokemonName;
            div.addEventListener('click', () => {
                pokemonInput.value = pokemonName;
                autocompleteResults.innerHTML = '';
            });
            autocompleteResults.appendChild(div);
        });
    }

    // Fetch data for a single Pokémon
    async function getPokemonData(name) {
        try {
            const response = await fetch(`${API_BASE_URL}pokemon/${name.toLowerCase()}`);
            if (!response.ok) throw new Error('Pokémon not found');
            return await response.json();
        } catch (error) {
            console.error("Error fetching Pokémon data:", error);
            return null;
        }
    }
    
    // Fetch species data to get evolution chain URL
    async function getSpeciesData(name) {
        try {
            const response = await fetch(`${API_BASE_URL}pokemon-species/${name.toLowerCase()}`);
            if (!response.ok) return null;
            const data = await response.json();
            return data.evolution_chain.url;
        } catch (error) {
            console.error("Error fetching species data:", error);
            return null;
        }
    }

    // Fetch and parse the evolution chain
    async function getEvolutionChain(url) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            const chain = [];
            let current = data.chain;
            do {
                chain.push(current.species.name);
                current = current.evolves_to[0];
            } while (!!current);
            return chain;
        } catch (error) {
            console.error("Error fetching evolution chain:", error);
            return [];
        }
    }

    // Calculate CP and HP
    function calculateStats(baseStats, ivs, level) {
        const cpm = CPM_TABLE[level];
        if (!cpm) return { cp: 0, hp: 0 };

        const totalAttack = baseStats.attack + ivs.attack;
        const totalDefense = baseStats.defense + ivs.defense;
        const totalStamina = baseStats.stamina + ivs.hp;

        const cp = Math.floor(
            (totalAttack * Math.pow(totalDefense, 0.5) * Math.pow(totalStamina, 0.5) * Math.pow(cpm, 2)) / 10
        );

        const hp = Math.floor(totalStamina * cpm);

        return { cp, hp };
    }
    
    // Main calculation logic
    async function handleCalculate() {
        resultContainer.innerHTML = 'Calculando...';
        const pokemonName = pokemonInput.value;
        const ivs = {
            attack: parseInt(attackIvInput.value) || 0,
            defense: parseInt(defenseIvInput.value) || 0,
            hp: parseInt(hpIvInput.value) || 0,
        };

        if (!pokemonName) {
            resultContainer.innerHTML = 'Por favor, introduce un nombre de Pokémon.';
            return;
        }

        const evolutionChainUrl = await getSpeciesData(pokemonName);
        if (!evolutionChainUrl) {
            resultContainer.innerHTML = 'No se pudo encontrar la cadena de evolución para este Pokémon.';
            return;
        }

        const evolutionChain = await getEvolutionChain(evolutionChainUrl);
        let resultsHTML = '';

        for (const evoName of evolutionChain) {
            const pokemonData = await getPokemonData(evoName);
            if (pokemonData) {
                const baseStats = {
                    attack: pokemonData.stats.find(s => s.stat.name === 'attack').base_stat,
                    defense: pokemonData.stats.find(s => s.stat.name === 'defense').base_stat,
                    stamina: pokemonData.stats.find(s => s.stat.name === 'hp').base_stat,
                };

                resultsHTML += `<h3>${evoName.charAt(0).toUpperCase() + evoName.slice(1)}</h3>`;
                
                // Great League
                let bestGL = { level: 0, cp: 0, hp: 0 };
                for (let level = 1; level <= 51; level += 0.5) {
                    const stats = calculateStats(baseStats, ivs, level);
                    if (stats.cp <= 1500) {
                        bestGL = { level, ...stats };
                    } else {
                        break;
                    }
                }
                resultsHTML += `<p><b>Liga Super:</b> Nivel ${bestGL.level} | PC ${bestGL.cp} | PS ${bestGL.hp}</p>`;

                // Ultra League
                let bestUL = { level: 0, cp: 0, hp: 0 };
                 for (let level = 1; level <= 51; level += 0.5) {
                    const stats = calculateStats(baseStats, ivs, level);
                    if (stats.cp <= 2500) {
                        bestUL = { level, ...stats };
                    } else {
                        break;
                    }
                }
                resultsHTML += `<p><b>Liga Ultra:</b> Nivel ${bestUL.level} | PC ${bestUL.cp} | PS ${bestUL.hp}</p>`;
            }
        }
        resultContainer.innerHTML = resultsHTML;
    }


    // --- Event Listeners ---
    pokemonInput.addEventListener('input', () => showAutocomplete(pokemonInput.value));
    document.addEventListener('click', (e) => {
        if (e.target !== pokemonInput) {
            autocompleteResults.innerHTML = '';
        }
    });
    calculateBtn.addEventListener('click', handleCalculate);

    // --- Initial Load ---
    fetchPokemonList();
});