Page({
  data: {
    recipes: [], newRecipeName:'', newRecipeSteps:'', newIngredientInput:'', imageUrl:'',
    fridge:[], cabinet:[], ingredientItems:[], filteredItems:[], keyword:'', recommendedRecipes:[]
  },
  onLoad() {
    const recipes = wx.getStorageSync('recipes')||[];
    const fridge = wx.getStorageSync('fridge')||[];
    const cabinet = wx.getStorageSync('cabinet')||[];
    const all = Array.from(new Set([...fridge,...cabinet]));
    const items = all.map(n=>({name:n,selected:false}));
    this.setData({ recipes, fridge, cabinet, ingredientItems:items, filteredItems:items });
  },
  onShow() {
    const recipes = wx.getStorageSync('recipes') || [];
    this.setData({ recipes });
  },
  onNameInput(e) { this.setData({ newRecipeName:e.detail.value }); },
  onStepsInput(e) { this.setData({ newRecipeSteps:e.detail.value }); },
  onKeywordInput(e) {
    const kw = e.detail.value.trim().toLowerCase();
    const filtered = this.data.ingredientItems.filter(i=>i.name.toLowerCase().includes(kw));
    this.setData({ keyword:e.detail.value, filteredItems:filtered });
  },
  toggleIngredient(e) {
    const nm = e.currentTarget.dataset.name;
    const items = this.data.ingredientItems.map(i=>i.name===nm?{...i,selected:!i.selected}:i);
    const filt = items.filter(i=>i.name.toLowerCase().includes(this.data.keyword.trim().toLowerCase()));
    this.setData({ ingredientItems:items, filteredItems:filt });
  },
  // <!--添加新材料原始方法-->
  // addNewIngredient(e) {
  //   const ing = e.detail.value.trim(); if(!ing) return;
  //   const fridge = wx.getStorageSync('fridge')||[];
  //   if(!fridge.includes(ing)){ fridge.push(ing); wx.setStorageSync('fridge',fridge); }
  //   const items = [...this.data.ingredientItems,{name:ing,selected:false}];
  //   this.setData({ ingredientItems:items, filteredItems:items, newIngredientInput:'' });
  // },
  addNewIngredient(e) {
    const ing = e.detail.value.trim();
    if (!ing) return;
  
    // 同步到缓存
    const fridge = wx.getStorageSync('fridge') || [];
    if (!fridge.includes(ing)) {
      fridge.push(ing);
      wx.setStorageSync('fridge', fridge);
    }
  
    // 更新本地列表
    const items = [...this.data.ingredientItems, { name: ing, selected: false }];
    this.setData({
      ingredientItems: items,
      filteredItems: items,
      keyword: '',
      newIngredientInput: ''  // ← 这行清空输入框
    });
  },
  deleteIngredient(e) {
    const name = e.currentTarget.dataset.name;
    // 从 ingredientItems 和 filteredItems 里移除
    const newItems = this.data.ingredientItems.filter(i => i.name !== name);
    const newFiltered = newItems.filter(i =>
      i.name.toLowerCase().includes(this.data.keyword.trim().toLowerCase())
    );
    // 从选中列表里清除
    const newSelected = this.data.selectedRecipeIngredients.filter(n => n !== name);
    // 同步存储冰箱（fridge）
    wx.setStorageSync('fridge', newItems.map(i => i.name));
    // 更新视图
    this.setData({
      ingredientItems: newItems,
      filteredItems: newFiltered,
      selectedRecipeIngredients: newSelected
    });
  },  
  chooseImage() {
    wx.chooseImage({count:1,sizeType:['compressed'],sourceType:['album','camera'],
      success:res=>this.setData({ imageUrl:res.tempFilePaths[0] })});
  },
  addRecipe() {
    const { newRecipeName,newRecipeSteps,imageUrl,recipes,ingredientItems } = this.data;
    const selected = ingredientItems.filter(i=>i.selected).map(i=>i.name);
    if(!newRecipeName||selected.length===0) return;
    const steps = newRecipeSteps.trim()?newRecipeSteps.trim().split('\n'):[];
    const newR = { name:newRecipeName, ingredients:selected, steps, image:imageUrl||'' };
    const updated = [...recipes,newR]; wx.setStorageSync('recipes',updated);
    const reset = ingredientItems.map(i=>({...i,selected:false}));
    this.setData({ recipes:updated,newRecipeName:'',newRecipeSteps:'',imageUrl:'',ingredientItems:reset,filteredItems:reset,keyword:'' });
  },
  // // 基于手动输入原材料的方式
  // recommendRecipes() {
  //   const selected = this.data.ingredientItems.filter(i=>i.selected).map(i=>i.name);
  //   const rec = this.data.recipes.map(r=>{
  //     const m = r.ingredients.filter(i=>selected.includes(i));
  //     return {...r,matchCount:m.length,total:r.ingredients.length};
  //   }).filter(r=>r.matchCount>0);
  //   this.setData({ recommendedRecipes:rec });
  // },
  // 推荐逻辑基于fridge有哪些食材的方式
  recommendRecipes() {
    const available = wx.getStorageSync('fridgeAvailable') || [];
    const rec = this.data.recipes.filter(recipe =>
      recipe.ingredients.every(ing => available.includes(ing))
    );
    this.setData({ recommendedRecipes: rec });
  },
  viewDetail(e) {
    const name = e.currentTarget.dataset.name;
    wx.navigateTo({url:`/pages/recipeDetail/recipeDetail?name=${encodeURIComponent(name)}`});
  }
});