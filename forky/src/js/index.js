import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';
import Likes from './models/Likes';

//Global state of the app
// Search object
// Current recipe object
//Shopping list object
// Liked recipes
const state = {};

window.state = state;

/**SEARCH CONTROLLER */
const controlSearch = async () => {
    // 1 Get query from view
    const query = searchView.getInput() 
    
    if(query) {
        //2 New search object and add to state
        state.search = new Search(query);

        //3 Prepare UI for results
        searchView.clearFields();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try{
            //4 Search for recipes
            await state.search.getResults();

            //5 Render results on UI
            //console.log(state.search.result)
            clearLoader();
            searchView.renderResults(state.search.result);
        }catch(err){
            alert('Something went wrong with fetching the recipe');
            clearLoader();
        }
        
        

        
    }
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();

});



elements.searchResPages.addEventListener('click', e =>{
    const btn = e.target.closest('.btn-inline')
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
        console.log(goToPage)
    }
})


/**Recipe CONTROLLER */
const controlRecipe = async () => {
    //GET ID FROM URL
    const id = window.location.hash.replace('#', '');
    if(id){
        //PREPARE UI FOR CHANGES
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //HIGHLIGHT selected search item
        if(state.search) searchView.highlitSelected(id);

        //CREATE NEW RECIPE OBJECT
        state.recipe = new Recipe(id);
        

        try{
            //GET RECIPE DATA AND PARSE INGREDIENTS
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //CALCULATE SERVINGS
            state.recipe.calcTime();

            state.recipe.calcServing();

            //RENDER RECIPE
            clearLoader();
            recipeView.renderRecipe(
                 state.recipe,
                 state.likes.isLiked(id)
                 );
        }catch(err){
            alert('Error')
        }
    }

};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


      /**List CONTROLLER */
        const controlList = () => {

                //Create a new list if there is none yet

            if(!state.list) state.list = new List();

                //Add each ingredient to the list and UI

            state.recipe.ingredients.forEach( el => {
                const item = state.list.addItem(el.count, el.unit, el.ingredient);

                listView.renderItem(item);
            });
        }


//Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    //Select the id of the li

    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Handle the delete button

    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        //delete the item from the state

        state.list.deleteItem(id);

        //delete the item from the ui 

        listView.deleteItem(id);
        
        //handle the count update
    }else if(e.target.matches('.shopping__count-value')){
        
        const val = parseFloat(e.target.value, 10);

        state.list.updateCount(id, val);

    }
})


   

/**Likes CONTROLLER */
const controlLike = () => {
    if(!state.likes) state.likes = new Likes();


    const currentID = state.recipe.id;

    //User has not liked the recipe yet
    if(!state.likes.isLiked(currentID)){

        //Add like to statee
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.img,
            state.recipe.author,
            state.recipe.title
        );
        //Toggle like button

        likesView.toggleLikeBtn(true);

        //Add like to the UI

        likesView.renderLikes(newLike);
    }else {
        //User has already liked the recipe 

        //Remove like from state
        state.likes.deleteLike(currentID);

        //Untoggle like button

        likesView.toggleLikeBtn(false);

        //Remove like from the UI
        likesView.deleteLike(currentID);


    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
}


    //restore liked recipes on page load

    window.addEventListener('load', () => {
        state.likes = new Likes();

        //restore liekd recipes
        state.likes.readStorage();

        //toggle likes button
        likesView.toggleLikeMenu(state.likes.getNumLikes());

        //render existing likes
        state.likes.likes.forEach(like => {
            likesView.renderLikes(like);
        })
    });


//Handling buttons
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')){
        //Decrease button clicked
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingIngredients(state.recipe);
        }
        
        
    } else if (e.target.matches('.btn-increase, .btn-increase *')){
        //Increase button clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingIngredients(state.recipe);

    } else if (e.target.matches('.recipe__btn-add, .recipe__btn-add *')){
        //CALS A FUNCTION WHICH TAKES CARE OF ADDING TO SHOP BUTTON^
        controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
        //Like controller
        controlLike();
    }
});

