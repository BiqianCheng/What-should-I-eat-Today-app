Page({
  data: {
    recipe: {
      name: '',
      ingredients: [],
      steps: [],
      image: ''
    }
  },
  onLoad(options) {
    const name = decodeURIComponent(options.name || '');
    const recipes = wx.getStorageSync('recipes') || [];
    const found = recipes.find(r => r.name === name);
    if (found) {
      this.setData({ recipe: found });
    }
  },
  onDelete() {
    const { recipe } = this.data;
    let recipes = wx.getStorageSync('recipes') || [];
    recipes = recipes.filter(r => r.name !== recipe.name);
    wx.setStorageSync('recipes', recipes);
    wx.navigateBack(); // 返回上一个页面
  }
});