// pages/fridge/fridge.js（集成百度 OCR）
Page({
  data: {
    fridgeItems: [],
    inputValue: ''
  },

  onLoad() {
    const saved = wx.getStorageSync('fridgeAvailable') || [];
    this.setData({ fridgeItems: saved });
  },

  /** 跳转到推荐菜谱页 */
  goToSuggestions() {
    wx.navigateTo({
      url: '/pages/suggestions/suggestions'
    });
  },
  
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sourceType: ['camera', 'album'],
      success: res => {
        const filePath = res.tempFilePaths[0];
        wx.getFileSystemManager().readFile({
          filePath,
          encoding: 'base64',
          success: base64res => {
            const base64 = base64res.data;
            this.callBaiduOCR(base64);
          }
        });
      }
    });
  },

  callBaiduOCR(base64img) {
    const access_token = '你的 access_token';
    wx.request({
      url: `https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general?access_token=${access_token}`,
      method: 'POST',
      header: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: { image: base64img },
      success: res => {
        if (res.data.result) {
          const names = res.data.result.map(i => i.keyword);
          const items = Array.from(new Set([...this.data.fridgeItems, ...names]));
          this.setData({ fridgeItems: items });
          wx.setStorageSync('fridgeAvailable', items);
          wx.showToast({ title: '识别成功', icon: 'success' });
        }
      },
      fail: err => {
        wx.showToast({ title: '识别失败', icon: 'none' });
        console.error(err);
      }
    });
  },

  addItem(e) {
    const name = e.detail.value.trim();
    if (!name) return;
    const items = Array.from(new Set([...this.data.fridgeItems, name]));
    this.setData({ fridgeItems: items, inputValue: '' });
    wx.setStorageSync('fridgeAvailable', items);
  },

  removeItem(e) {
    const name = e.currentTarget.dataset.name;
    const items = this.data.fridgeItems.filter(i => i !== name);
    this.setData({ fridgeItems: items });
    wx.setStorageSync('fridgeAvailable', items);
  },

  clearFridge() {
    wx.removeStorageSync('fridgeAvailable');
    this.setData({ fridgeItems: [] });
    wx.showToast({ title: '已清空', icon: 'none' });
  }
});