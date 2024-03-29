"use strict";
import { autocomplete } from "./autocomplete.js";

/////////////////////////////////////////
///////######## GLOBAL VARIABLES ############
//------- Selectors ----------
const container = document.querySelector(".main-container");
const searchElement = document.getElementById("search");
const searchInput = document.querySelector('input[name="search-bar"]');
const submit = document.getElementById("search-bar");
const loader = document.querySelector(".loader");
const results = document.querySelector(".results"); //
const resetButton = document.querySelector(".reset");
const errorMessage = document.querySelector(".error");
const successMessage = document.querySelector(".fav-success");
const removeMessage = document.querySelector(".fav-remove");
let heart;

///////////////////////////////////////////
/////////------- Arrays & Objects ----------
const bgImages = [
  "./resources/images/forest_background.jpg",
  "./resources/images/field.jpg",
  "./resources/images/galar-scenery.png",
  "./resources/images/night.jpg",
  "./resources/images/training.jpg",
  "./resources/images/poke-background.webp",
];

/* #### TRUE GLOBAL MODULE VARIABLES TO USE WHILE DEBUG ### */
// window.names = names;
// window.pokemon = pokemon;
// window.bgImages = bgImages;

///////////////////////////////////////////
/////////------- FUNCTIONS ----------
class App {
  #names;
  pokemon = {};
  constructor() {
    this._initHome();
  }

  _initHome() {
    //Gets Pokemon Names for Autocomplete
    this._loadPokeNames();
    // Creates Eventlistener & Autocomplete feature for Searchbar
    autocomplete(searchInput, this.#names);
    // Assigns Event Listeners when Initialized
    resetButton.addEventListener("click", this._resetSearch);
    submit.addEventListener("submit", this._searchPokemon.bind(this));
  }

  //########## Grab & Store Pokemon Names for Autocomplete ##########
  _loadPokeNames() {
    // IF Names in local Storage then set to #names from localstorage
    this.#names = this._getLocalstorage("autoNames") || [];
    // IF names NOT in localstorage, then feth from API
    if (!this.#names.length) {
      const request = fetch("https://pokeapi.co/api/v2/pokemon?limit=250");

      request
        .then((response) => response.json())
        .then((data) => {
          //Takes response and loops through results to push pokemon names to names array.
          data.results.forEach((poke) => {
            this.#names.push(poke.name);
          });
          this._setLocalstorage("autoNames", this.#names);
        })
        .catch((error) => console.log(error));
    }
  }

  _setLocalstorage(key, value) {
    if (!localStorage[key]) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      const storageArr = this._getLocalstorage(key);
      storageArr.push(value);
      localStorage.setItem(key, JSON.stringify(storageArr));
    }
  }

  _getLocalstorage(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  _removeFromLocalstorage() {
    let pokeFav = this._getLocalstorage("fav");
    let pokeIdx = pokeFav.findIndex((obj) => obj.name === this.pokemon.name);

    pokeFav.splice(pokeIdx, 1);
    console.log(pokeFav);
    // localStorage.removeItem("fav");
    localStorage.setItem("fav", JSON.stringify(pokeFav));
  }

  //############ Search Function ###############
  // **** REFACTOR HIDE/SHow
  _searchPokemon(e) {
    e.preventDefault();

    // Saves Searched Value
    const pokeSearchValue = searchInput.value.toLowerCase();
    // Pulls LocalStore or Assigns Empty Array
    const localSaved = JSON.parse(localStorage.getItem("fav")) || [];

    // Hide Search Field and Show Loader
    searchElement.hidden = true;
    loader.hidden = false;

    // For Saved Pokemon & Creates card if Found
    if (localSaved.some((obj) => obj.name === pokeSearchValue)) {
      console.log("✔ FAVORITE POKEMON! -> In Favorite LocalStorage");
      this.pokemon = localSaved.find((obj) => obj.name === pokeSearchValue);

      console.log("🃏 CARD CREATED! -> From LocalStorage");
      console.log(this.pokemon);
      this._createPokeCard(this.pokemon);
    }
    // If not Saved Searches API
    else {
      console.log("❌ NOT A FAVORITE! -> Searching API");
      this._searchPokemonAPI(pokeSearchValue);
    }
  }

  /// **** REFACTOR CATCH / SHOW HIDE
  _searchPokemonAPI(pokemonSearched) {
    const pokeRequest = fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonSearched}`
    );

    pokeRequest
      .then((response) => response.json())
      .then((pokeJSON) => {
        // console.log(pokeJSON);
        // Destructure Response into Pokemon Object//
        ({
          name: this.pokemon.name,
          sprites: {
            other: {
              "official-artwork": { front_default: this.pokemon.img },
            },
          },
          stats: [
            { base_stat: this.pokemon.hp },
            { base_stat: this.pokemon.attack },
            { base_stat: this.pokemon.defense },
            { base_stat: this.pokemon.special_attack },
            { base_stat: this.pokemon.special_defense },
            { base_stat: this.pokemon.speed },
          ],
          fav: this.pokemon.fav = false,
        } = pokeJSON);

        console.log("Pokemon API Search Found 🔍", this.pokemon);
        console.log("🃏 CARD CREATED! -> From API");
        this._createPokeCard(this.pokemon);
      })
      .catch((error) => {
        loader.hidden = true;
        errorMessage.hidden = false;
        resetButton.hidden = false;
        console.log(error);
      });
  }

  // ####### Generates the Pokemon Card #########
  //***** REFACTOR EVENT DELEGATION / SHOW HIDE
  _createPokeCard(object) {
    // Assign values to Results Card
    console.log("create", object);
    const cardHTML = `
    <div class="results">
          <div class="row" id="poke-name">
              <p>${object.name}</p>
              <p id="hp">${object.hp} HP</p>
              <img
                src="${
                  object.fav
                    ? "./resources/images/heartline-fill.png"
                    : "./resources/images/heartline.png"
                }"
                id="favorite"
                data-saved="${object.fav}"
              />
          </div>
          <div class="row" id="poke-image" style="background-image: url('${
            bgImages[Math.floor(Math.random() * 6)]
          }')">
             <img src="${object.img}" />
          </div>

          <div class="row" id="poke-stats">
            <div class="stats" id="stats1">
                <div id="attack">
                  <h6>attack</h6>
                  <p class="num">${object.attack}</p>
                </div>
                <div id="speed">
                  <h6>speed</h6>
                  <p class="num">${object.speed}</p>
                </div>
                <div id="defense">
                  <h6>defense</h6>
                  <p class="num">${object.defense}</p>
              </div>
            </div>

            <div class="stats" id="stats2">
                <div id="special-attack">
                  <h6>special attack</h6>
                  <p class="num">${object.special_attack}</p>
                </div>
                <div id="special-defense">
                  <h6>special defense</h6>
                  <p class="num">${object.special_defense}</p>
                </div>
            </div>
        </div>
    </div>
`;
    // *** Refactor for Event Delegation and Hide
    setTimeout(() => {
      loader.hidden = true;
      resetButton.hidden = false;
      container.insertAdjacentHTML("afterbegin", cardHTML);
      heart = document.querySelector("#favorite"); //Need to move to here because HTML does not exist prior
      heart.addEventListener("mouseenter", this._hoverFav); // Same as above
      heart.addEventListener("mouseleave", this._hoverOutFav);
      heart.addEventListener("click", this._toggleFav.bind(this));
    }, 3000);
  }

  // ####### Resets Search & Card #########
  _resetSearch() {
    searchInput.value = "";
    resetButton.hidden = true;
    searchElement.hidden = false;
    searchInput.focus();
    errorMessage.hidden = true;
    document.querySelector(".results").remove();
  }

  //######## Favorite Functions ###########
  _hoverFav() {
    this.dataset.saved == "true"
      ? (this.src = "./resources/images/heartline.png")
      : (this.src = "./resources/images/heartline-fill.png");
  }

  _hoverOutFav() {
    this.dataset.saved == "true"
      ? (this.src = "./resources/images/heartline-fill.png")
      : (this.src = "./resources/images/heartline.png");
  }

  //***** REFACTOR SHOW / HIDE
  _toggleFav(e) {
    this.pokemon.fav = !this.pokemon.fav;

    // If Not Already Favorite
    if (e.target.dataset.saved == "false") {
      //Check if Pokemon previously saved?
      e.target.dataset.saved = "true";
      e.target.src = "./resources/images/heartline-fill.png";

      // Show Success Message
      successMessage.hidden = false;
      successMessage.textContent = `${this.pokemon.name.toUpperCase()} added to your favorites!`;
      setTimeout(() => {
        successMessage.hidden = true;
      }, 3000);

      if (!localStorage.fav) {
        //Checks to see if first pokemon saved
        this._setLocalstorage("fav", [this.pokemon]);
        // localStorage.setItem("fav", `[${JSON.stringify(this.pokemon)}]`);
      } else {
        // let pokeFav = this._getLocalstorage("fav");
        // pokeFav.push(this.pokemon);
        this._setLocalstorage("fav", this.pokemon);
      }
    }
    // If Already Favorite
    else {
      e.target.dataset.saved = "false";
      e.target.src = "./resources/images/heartline.png";

      this._removeFromLocalstorage();

      //Show Remove Favorite Message
      removeMessage.hidden = false;
      removeMessage.textContent = `${this.pokemon.name.toUpperCase()} removed from your favorites!`;
      setTimeout(() => {
        removeMessage.hidden = true;
      }, 3000);
    }
  }
}

//////////////////////////////////////
// ########### EVENTS ##############
// Initiates App
const app = new App();
