import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
import { apiCall } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: RES_PER_PAGE,
    page: 1,
  },
  bookmarks: [],
};

export const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    imageUrl: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await apiCall(`${API_URL}/${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);
    state.recipe.bookmarked = state.bookmarks.some(
      bookmark => bookmark.id === state.recipe.id
    )
      ? true
      : false;
  } catch (err) {
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await apiCall(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        imageUrl: rec.image_url,
        publisher: rec.publisher,
        title: rec.title,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (error) {
    throw error;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  let start = (page - 1) * state.search.resultsPerPage;
  let end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  const oldServings = state.recipe.servings;

  state.recipe.ingredients.forEach(ing => {
    ing.quantity = ing.quantity
      ? (ing.quantity * newServings) / oldServings
      : ing.quantity;
  });
  state.recipe.servings = newServings;
};

export const toogleBookmark = function (recipe) {
  // toogle bookmark option of currrent recipe
  if (recipe.id === state.recipe.id)
    state.recipe.bookmarked = !state.recipe.bookmarked;

  // add bookmark
  if (state.recipe.bookmarked) state.bookmarks.push(recipe);
  // remove bookmark
  else
    state.bookmarks = state.bookmarks.filter(
      bookmark => bookmark.id !== recipe.id
    );

  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(([key, value]) => key.startsWith('ingredient') && value !== '')
      .map(([_, value]) => {
        const elements = value.split(',').map(el => el.trim());

        if (elements.length !== 3)
          throw new Error(
            'Wrong ingredient format! Please use correct format!'
          );

        const [quantity, unit, description] = elements;
        return {
          quantity: quantity ? +quantity : null,
          unit,
          description,
        };
      });

    const recipe = {
      cooking_time: +newRecipe.cookingTime,
      image_url: newRecipe.imageUrl,
      source_url: newRecipe.sourceUrl,
      publisher: newRecipe.publisher,
      servings: +newRecipe.servings,
      title: newRecipe.title,
      ingredients,
    };

    const data = await apiCall(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    toogleBookmark(state.recipe);
  } catch (error) {
    throw error;
  }
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

init();
