Page({
  data: {
    canCook: []
  },

  onShow() {
    const fridge = wx.getStorageSync('fridge') || [];
    const cabinet = wx.getStorageSync('cabinet') || [];
    const allMaterials = [...fridge, ...cabinet];

    const recipes = wx.getStorageSync('recipes') || [];

    const canCook = recipes.filter(recipe => {
      return recipe.ingredients.every(ing => allMaterials.includes(ing));
    });

    this.setData({ canCook });
  }
});
