Page({
  data: {
    canCook: []
  },

  onShow() {
    const fridge = wx.getStorageSync('fridge') || [];
    const cabinet = wx.getStorageSync('cabinet') || [];
    // const allMaterials = [...fridge, ...cabinet];
    const available = Array.from(new Set([...fridge, ...cabinet]));
    const recipes = wx.getStorageSync('recipes') || [];

    const canCook = recipes.filter(recipe =>
      recipe.ingredients.every(ing => allMaterials.includes(ing))
    );
    this.setData({ canCook });
  },

  viewDetail(e) {
    const name = e.currentTarget.dataset.name;
    wx.navigateTo({
      url: `/pages/recipeDetail/recipeDetail?name=${encodeURIComponent(name)}`
    });
  }
});
