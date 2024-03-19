document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('ingredientForm');
    const recipeResultsDiv = document.getElementById('recipeResults');

    form.addEventListener('submit', async function(event) {
        event.preventDefault(); 

        const ingredientsInput = document.getElementById('ingredients').value;

        // Display loading spinner within its container
        recipeResultsDiv.innerHTML = '<div class="loading-spinner-container"><div class="loading-spinner"></div></div>';


        // Call a function to generate a single recipe based on user input ingredients
        generateRecipe(ingredientsInput);
    });

    async function generateRecipe(ingredients) {
        try {
            // Prompt for generating a recipe using the user's ingredients
            const prompt = `Generate a recipe using ingredients: ${ingredients}.`;

            // Send a request to OpenAI API to generate the recipe
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer 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' // Replace with your API key
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo-0125',
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 500,
                    temperature: 1.5,
                    top_p: 1
                })
            });

            // Check if the response status code is in the successful range (200-299)
            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Network response was not ok. Status: ${response.status}. Error: ${errorMessage}`);
            }

            const data = await response.json();
            const recipe = data.choices[0].message.content.trim(); // Get the generated recipe from the response

            // Display the generated recipe
            displayRecipe(recipe);
        } catch (error) {
            console.error('Error generating recipe:', error);
            recipeResultsDiv.innerHTML = `<p>Error generating recipe: ${error.message}</p>`;
        }
    }

    function displayRecipe(recipe) {
        // Clear previous recipe result
        recipeResultsDiv.innerHTML = '';

        // Extract the dish name from the recipe text
        const dishName = recipe.split('\n')[0].trim();

        // Remove the dish name from the recipe text
        const recipeText = recipe.replace(dishName, '').trim();

        // Split recipe text into ingredients and instructions
        const [ingredientsText, instructionsText] = recipeText.split('Instructions:');

        // Remove the duplicate "Ingredients:" label from the ingredients text
        const ingredientsContent = ingredientsText.replace('Ingredients:', '').trim();

        // Format ingredients as a bulleted list
        const formattedIngredients = ingredientsContent
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(ingredient => `- ${ingredient.trim()}`)
            .join('<br>');

        // Format instructions with step numbers
        const formattedInstructions = instructionsText
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => `<p style="margin-bottom: 5px;">${line.trim()}</p>`)
        .join('');

        // Create HTML markup for the recipe details
        const recipeHTML = `
            <div class="recipe">
                <h3>${dishName}</h3>
                <img src="/img/noimage.png" alt="${dishName}">
                <h4>Ingredients:</h4>
                <ul class="ingredients">
                    ${formattedIngredients}
                </ul>
                <h4>Instructions:</h4>
                <ol class="instructions">
                    ${formattedInstructions}
                </ol>
            </div>
        `;

        // Append the recipe HTML to the recipeResultsDiv
        recipeResultsDiv.innerHTML += recipeHTML;
    }
});
