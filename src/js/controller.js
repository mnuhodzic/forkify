import * as model from "./model";
import recipeView from "./views/recipeView";

import "core-js/stable";
import "regenerator-runtime/runtime";
// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    // if there is no id in URL
    if (!id) return;
    recipeView.renderSpinner();

    // load recipe
    await model.loadRecipe(id);

    // render recipe
    recipeView.render(model.state.recipe);
  } catch (error) {
    console.error(error);
  }
};

["hashchange", "DOMContentLoaded"].forEach((event) =>
  window.addEventListener(event, controlRecipes)
);
