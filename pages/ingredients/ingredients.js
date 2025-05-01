Page({
  data: {
    recipes: [],
    newRecipeName: '',
    fridge: [],
    cabinet: [],
    allIngredients: [],
    filteredIngredients: [],
    selectedRecipeIngredients: [],
    keyword: '',
    recommendedRecipes: []
  },

  onLoad() {
    const savedRecipes = wx.getStorageSync('recipes') || [];
    const fridge = wx.getStorageSync('fridge') || [];
    const cabinet = wx.getStorageSync('cabinet') || [];
    const all = Array.from(new Set([...fridge, ...cabinet]));
    this.setData({
      recipes: savedRecipes,
      fridge,
      cabinet,
      allIngredients: all,
      filteredIngredients: all
    });
  },

  onNameInput(e) {
    this.setData({ newRecipeName: e.detail.value });
  },

  onKeywordInput(e) {
    const keyword = e.detail.value.toLowerCase();
    const filtered = this.data.allIngredients.filter(item => item.toLowerCase().includes(keyword));
    this.setData({
      keyword: e.detail.value,
      filteredIngredients: filtered
    });
  },

  toggleIngredient(e) {
    const name = e.currentTarget.dataset.name;
    let selected = this.data.selectedRecipeIngredients;
    if (selected.includes(name)) {
      selected = selected.filter(i => i !== name);
    } else {
      selected.push(name);
    }
    this.setData({ selectedRecipeIngredients: selected });
  },

  addRecipe() {
    const { newRecipeName, selectedRecipeIngredients, recipes } = this.data;
    if (!newRecipeName || selectedRecipeIngredients.length === 0) return;

    const newRecipe = {
      name: newRecipeName,
      ingredients: selectedRecipeIngredients
    };

    const updated = [...recipes, newRecipe];
    this.setData({
      recipes: updated,
      newRecipeName: '',
      selectedRecipeIngredients: [],
      keyword: '',
      filteredIngredients: this.data.allIngredients
    });
    wx.setStorageSync('recipes', updated);
  },

  removeRecipe(e) {
    const index = e.currentTarget.dataset.index;
    const updated = this.data.recipes.filter((_, i) => i !== index);
    this.setData({ recipes: updated });
    wx.setStorageSync('recipes', updated);
  },

  recommendRecipes() {
    const { recipes, selectedRecipeIngredients } = this.data;
    const recommended = recipes.map(recipe => {
      const matched = recipe.ingredients.filter(i => selectedRecipeIngredients.includes(i));
      return {
        ...recipe,
        matchCount: matched.length,
        total: recipe.ingredients.length
      };
    }).filter(r => r.matchCount > 0);

    this.setData({ recommendedRecipes: recommended });
  }
});
