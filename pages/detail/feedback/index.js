import request from "/common/request/request";
import { ddToast, debounce } from "/common/utils/utils";
Page({
  data: {
    mode: false, //暗黑模式
    adpotDeatil: null,
    adoptComment: [],
    placeholder: "一起讨论吧...",
    focus: false,
    commentComment: "",
    commentObj: {},
    pageNo: 1,
    total: 0,
    shareImg:
      "https://lianen-data-develop.oss-cn-shanghai.aliyuncs.com/topic/78a739607b54a17147e1cd82884f22e3/f37421ae-3aa3-4f55-9004-2d6353888707.jpeg?Expires=1942725425&OSSAccessKeyId=LTAI5t9iqts8pXE9AdrwCyDn&Signature=k%2BoJefnyTsEk0Oq6LkJf%2BCwcFYM%3D",
    baselineShow: false,
    netWorkError: false,
    errorNodata: true,
    keyboardHeight: 0,
    textareaBottom: 0
  },
  textareaInput(e) {
    const content = e.detail.value;
    if (content.trim().length > 0) {
      this.setData({ commentComment: content, "commentObj.content": content });
    } else {
      this.setData({ commentComment: "", "commentObj.content": content });
    }
  },
  publishComment() {
    if (!this.data.commentObj.content) {
      return false;
    }
    const params = {
      content: this.data.commentObj.content,
      opinionId: this.data.commentObj.opinionId,
      opinionCommentId: this.data.commentObj.opinionCommentId || "",
      anonymousName: getApp().globalData.isAnonymous
        ? this.data.adpotDeatil.anonymousName
        : "",
      isAnonymous: getApp().globalData.isAnonymous
    };
    request
      .post({
        url: "opinion/comment",
        params
      })
      .then(res => {
        if (res.code === 204) {
          this.setData({
            placeholder: "一起讨论吧...",
            commentComment: "",
            commentObj: { opinionId: this.data.commentObj.opinionId }
          });
          ddToast({ type: "fail", text: "部分文字无法通过审核，请检查" });
          return false;
        }
        if (res) {
          this.$spliceData({
            adoptComment: [this.data.adoptComment.length, 0, { ...res }]
          });
          this.setData({
            placeholder: "一起讨论吧...",
            commentComment: "",
            commentObj: { opinionId: this.data.commentObj.opinionId }
          });
        }
      });
  },
  toSupport(e) {
    const { id, anonymousName, action } = e.target.dataset;
    let countString = "";
    let countValue = 0;
    let actionString = "";
    let actionValue = false;
    if (action === "up") {
      countString = `adpotDeatil.upCount`;
      countValue = this.data.adpotDeatil.upCount;
      actionString = `adpotDeatil.isCurrentUserUp`;
      actionValue = this.data.adpotDeatil.isCurrentUserUp;
    } else {
      countString = `adpotDeatil.downCount`;
      countValue = this.data.adpotDeatil.downCount;
      actionString = `adpotDeatil.isCurrentUserDown`;
      actionValue = this.data.adpotDeatil.isCurrentUserDown;
    }
    request
      .post(
        {
          url: "opinion/vote",
          params: {
            id,
            action,
            anonymousName: getApp().globalData.isAnonymous ? anonymousName : "",
            isAnonymous: getApp().globalData.isAnonymous
          }
        },
        false
      )
      .then(res => {
        if (res) {
          this.setData({
            [actionString]: !actionValue,
            [countString]: actionValue ? countValue - 1 : countValue + 1
          });
        }
      });
  },
  commentToSupport(e) {
    const { id, action } = e.target.dataset;
    const anonymousName = this.data.adpotDeatil.anonymousName;
    const findIndex = this.data.adoptComment.findIndex(item => item.id === id);
    if (findIndex >= 0) {
      let countString = "";
      let countValue = 0;
      let actionString = "";
      let actionValue = false;
      if (action === "up") {
        countString = `adoptComment[${findIndex}].upCount`;
        countValue = this.data.adoptComment[findIndex].upCount;
        actionString = `adoptComment[${findIndex}].isCurrentUserUp`;
        actionValue = this.data.adoptComment[findIndex].isCurrentUserUp;
      } else {
        countString = `adoptComment[${findIndex}].downCount`;
        countValue = this.data.adoptComment[findIndex].downCount;
        actionString = `adoptComment[${findIndex}].isCurrentUserDown`;
        actionValue = this.data.adoptComment[findIndex].isCurrentUserDown;
      }
      request
        .post(
          {
            url: "opinion/comment/vote",
            params: {
              id,
              action,
              anonymousName: getApp().globalData.isAnonymous
                ? anonymousName
                : "",
              isAnonymous: getApp().globalData.isAnonymous
            }
          },
          false
        )
        .then(res => {
          if (res) {
            this.setData({
              [actionString]: !actionValue,
              [countString]: actionValue ? countValue - 1 : countValue + 1
            });
          }
        });
    }
  },
  toComment(event) {
    const authorId = event.target.dataset.authorId;
    const authorName = event.target.dataset.authorName;
    this.setData({ placeholder: `回复${authorName}` });
    this.onFocus();
  },
  replyComment(e) {
    const { opinionCommentId, authorName } = e.target.dataset;
    this.setData({
      placeholder: `回复${authorName}`,
      "commentObj.opinionCommentId": opinionCommentId
    });
    this.onFocus();
  },
  // onFocus() {
  //   this.setData({ focus: true });
  // },
  onFocus: debounce(function(e) {
    this.setData({ focus: true });
  }, 200),
  onBlur() {
    this.setData({ focus: false, placeholder: "一起讨论吧..." });
  },
  onKeyboardShow(res) {
    if (res.data.height != this.data.keyboardHeight) {
      const dValue = res.data.height - this.data.keyboardHeight;
      dValue > 0 && dValue < 80
        ? this.setData({
            keyboardHeight: res.data.height,
            textareaBottom: 30
          })
        : this.setData({
            keyboardHeight: res.data.height,
            textareaBottom: 0
          });
    }
  },
  onKeyboardHide() {
    this.setData({ textareaBottom: 0, keyboardHeight: 0 });
    this.onBlur();
  },
  previewImg(e) {
    const index = e.target.dataset.index || 0;
    const id = e.target.dataset.id || 0;
    const target = this.data.dynamics.filter(item => item.id === id)[0];
    if (target) {
      dd.previewImage({
        current: index,
        urls: [...target.dynamic.pics]
      });
    }
  },
  getDetailData() {
    this.setData({ baselineShow: false });
    request
      .get({
        url: "opinion/detail",
        params: {
          id: this.data.commentObj.opinionId,
          pageNo: this.data.pageNo,
          commentId:
            this.data.adoptComment.length > 0
              ? this.data.adoptComment[this.data.adoptComment.length - 1].id
              : 0
        }
      })
      .then(res => {
        if (Object.keys(res.opinion).length > 0) {
          this.setData(
            {
              total: res.solutionCommentCount,
              adpotDeatil: { ...res.opinion },
              adoptComment: [...this.data.adoptComment, ...res.solutionComment]
            },
            () => {
              this.setData({
                errorNodata: Object.keys(this.data.adpotDeatil).length > 0,
                netWorkError: false
              });
            }
          );
        } else {
          this.setData(
            {
              total: 0,
              adpotDeatil: null,
              adoptComment: []
            },
            () => {
              this.setData({
                errorNodata: false,
                netWorkError: false
              });
            }
          );
        }
        dd.stopPullDownRefresh();
      })
      .catch(err => {
        this.setData({ netWorkError: true, errorNodata: false });
        dd.stopPullDownRefresh();
      });
  },
  lower(e) {
    if (this.data.adoptComment.length < this.data.total) {
      this.setData({ pageNo: ++this.data.pageNo }, () => {
        this.getDetailData();
      });
    } else {
      this.setData({ baselineShow: true });
    }
  },
  onLoad(query) {
    if (query.isShare === "1") {
      if (query.id) {
        if (getApp().globalData.token) {
          dd.switchTab({
            url: "/pages/dynamic/index",
            complete() {
              setTimeout(() => {
                dd.navigateTo({
                  url: `/pages/detail/feedback/index?id=${query.id}`
                });
              });
            }
          });
        } else {
          getApp()
            .getAuthCode()
            .then(res => {
              dd.switchTab({
                url: "/pages/dynamic/index",
                complete() {
                  setTimeout(() => {
                    dd.navigateTo({
                      url: `/pages/detail/feedback/index?id=${query.id}`
                    });
                  });
                }
              });
            });
          // getApp().tokenCallback = token => {
          //   if (token != "") {
          //     dd.switchTab({
          //       url: "/pages/dynamic/index",
          //       success() {
          //         dd.redirectTo({
          //           url: `/pages/detail/feedback/index?id=${query.id}`
          //         });
          //       }
          //     });
          //   }
          // };
        }
      }
    } else {
      // 页面加载
      const { id } = query;
      if (id) {
        this.setData({ "commentObj.opinionId": id });
        if (getApp().globalData.token) {
          this.getDetailData();
        } else {
          getApp()
            .getAuthCode()
            .then(res => {
              this.getDetailData();
            });
          // getApp().tokenCallback = token => {
          //   if (token != "") {
          //     this.getDetailData();
          //   }
          // };
        }
      }
    }
  },
  onReady() {
    // 页面加载完成
  },
  onShow() {
    // 页面显示
    this.setData({ mode: getApp().globalData.isAnonymous });
    getApp().watch(value => {
      this.setData({ mode: value });
    });
  },
  onHide() {
    // 页面隐藏
    this.setData({ suspensionShow: false });
  },
  // onUnload () {
  //   // 页面被关闭
  // },
  // onTitleClick () {
  //   // 标题被点击
  // },
  showDelete() {
    this.setData({ isDelete: !this.data.isDelete });
  },
  onPullDownRefresh() {
    this.setData(
      { pageNo: 1, total: 0, adpotDeatil: null, adoptComment: [] },
      () => {
        this.getDetailData();
      }
    );
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: "小程序",
      desc: "您的好友给您分享了一条建议",
      imageUrl: this.data.shareImg,
      path: `pages/detail/feedback/index?id=${this.data.commentObj.opinionId}&isShare=1`
    };
  }
});
