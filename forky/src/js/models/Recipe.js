import axios from 'axios';
import proxy from '../config';

export default class Recipe {
    constructor(id){
        this.id = id;
    }

    async getRecipe(){
        try{
            const res = await axios(`${proxy}https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.author = res.data.recipe.publisher;
            this.title = res.data.recipe.title;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
            
        }catch(error){
            console.log(error)
            alert(`Something wrong`)
        }
    }

    async calcTime(){
        //assuming we need 15 mins for each 3 ingredient
        const numIngredients = this.ingredients.length;
        const periods = Math.ceil(numIngredients / 3);
        this.time = periods * 15;
    }

    calcServing(){
        this.servings = 4;
    }

    parseIngredients(){
    
        const unitsLong = ['tablespoon', 'tablespoons', 'ounce', 'ounces', 'teaspoon', 'teaspoons', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g']

        const newIngredients = this.ingredients.map(el => {

            //UNIFORM UNITS
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i])
            });

            //REMOVE PARANTHESES
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            //Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;

            if(unitIndex > -1){
                //There is a unit
                //Ex. 4 1/2 cups, arrcount is [4, 1/2]
                //Ex 4 cups, arrcount is [4]

                const arrCount = arrIng.slice(0, unitIndex);

                let count;
                if(arrCount.length === 1){
                    count = arrIng[0].replace('-', '+');
                }else{
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }

            }else if(parseInt(arrIng[0], 10)){
                //There isnt a unit, but the first element is a number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            }else if(unitIndex === -1){
                //There isnt a unit and No Number at first position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

            return objIng;

        });

        this.ingredients = newIngredients;
    }

    updateServings (type){
        //SERVINGS
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;
        
        //ingredients
        this.ingredients.forEach(ing => {

            ing.count = ing.count * ( newServings / this.servings);

            
        });

        this.servings = newServings;
    }
}