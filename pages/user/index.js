import { createUUID } from "/common/utils/utils";
Page({
  data: {
    mode: false, //暗黑模式
    tabs: ["我的动态", "我的建议"],
    tabIndex: 0,
    mydynamicHide: false,
    mysuggestHide: true,
    userInfo: {
      ...getApp().userData
    },
    mydynamicKey: "",
    mysuggestKey: "",
    shareImg:
      "https://lianen-data-develop.oss-cn-shanghai.aliyuncs.com/topic/78a739607b54a17147e1cd82884f22e3/f37421ae-3aa3-4f55-9004-2d6353888707.jpeg?Expires=1942725425&OSSAccessKeyId=LTAI5t9iqts8pXE9AdrwCyDn&Signature=k%2BoJefnyTsEk0Oq6LkJf%2BCwcFYM%3D"
  },
  tabClick(e) {
    const tabIndex = e.target.dataset.index;
    tabIndex === 0
      ? this.setData({ tabIndex, mydynamicHide: false, mysuggestHide: true })
      : this.setData({ tabIndex, mydynamicHide: true, mysuggestHide: false });
  },
  onLoad(query) {
    // this.setData({ mydynamicKey: createUUID(), mysuggestKey: createUUID() });
    // 页面加载
  },
  onReady() {
    // 页面加载完成
    this.setData({ userInfo: { ...getApp().userData } });
  },
  onShow() {
    // 页面显示
    this.setData({
      mode: getApp().globalData.isAnonymous,
      mydynamicKey: createUUID(),
      mysuggestKey: createUUID()
    });
    getApp().watch(value => {
      this.setData({ mode: value });
    });
  },
  onHide() {
    // 页面隐藏
    this.setData({ suspensionShow: false });
  },
  onUnload() {
    // 页面被关闭
  },
  onTitleClick() {
    // 标题被点击
  },
  onPullDownRefresh() {
    // 页面被下拉
    this.data.tabIndex === 0
      ? this.setData({ mydynamicKey: createUUID() })
      : this.setData({ mysuggestKey: createUUID() });
  },
  onShareAppMessage(option) {
    // 返回自定义分享信息
    const { shareImg } = this.data;
    const path = "pages/dynamic/index";
    return {
      title: "小程序",
      desc: "",
      imageUrl: shareImg,
      path
    };
  },
  onReachBottom() {
    // 页面被拉到底部
  }
});
