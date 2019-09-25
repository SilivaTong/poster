// pages/my/my.js

//全局参数
let ajax_type; //提交类型；
let savedImgUrl; //名片图片地址
let state; //用户状态 0 未认证（也不是认证中） 1 已认证（返回认证通过后的资料）2 资料填写中（返回认证期间填写的资料）3 审核中 4 审核不通过（返回不通过信息）
let info; //用于绘图（需要将用户信息绘制在海报上时需要先获取用户信息）
Page({
  //获取用户信息判断是否认证
  getUserInfo() {
    let that = this;
    util.requestUrl({
      url: "", 
      data: {
        ajax_type: ''
      },
      success: function(res) {
        console.log(res)
      }
    }).then(res => {
      //console.log('用户身份', res)
      if (res.data==1) { //获取已认证用户信息
        util.requestUrl({
          url: "",
          data: {
            ajax_type: 'ematt'
          },
          success: function(res) {
            console.log(res)
          }
        }).then(res => {
          //console.log('用户信息', res)
          that.setData({
            proveInfo: res.data,
            isProve: true,
          })
          info = res.data;
          state = res.data.state;
        })

      } else {
        that.setData({
          isProve: false,
        })
      }
    })

  },


  /**
   * 页面的初始数据
   */
  data: {
    isProve: null, //是否认证
    proveInfo: null, //已认证用户信息
    shopUrl: false,
    wenxuesheUrl: false,
    hidden: true,
    busseUrl: null,
  },
  

  //隐藏名片
  ishidden: function() {
    let that = this;
    that.setData({
      hidden: true,
    })
  },

  //保存海报
  saveImageToPhoto: function() {
    let that = this;
    that.setData({
      busseUrl: savedImgUrl,
    })
    let timer = setTimeout(function() {
      if (savedImgUrl != "") {
        wx.saveImageToPhotosAlbum({
          filePath: savedImgUrl + '',
          success: function() {
            console.log('图片保存成功')
            that.setData({
              hidden: false,
            })
          },
          fail: function(res) {
            console.log(res);
            if (res.errMsg == "saveImageToPhotosAlbum:fail cancel") {
              wx.showModal({
                title: '保存图片失败',
                content: '您已取消保存图片到相册！',
                showCancel: false
              });
            } else {
              wx.showModal({
                title: '提示',
                content: '保存图片失败，您可以点击确定设置获取相册权限后再尝试保存！',
                complete: function(res) {
                  console.log(res);
                  if (res.confirm) {
                    wx.openSetting({}) //打开小程序设置页面，可以设置权限
                  } else {
                    wx.showModal({
                      title: '保存图片失败',
                      content: '您已取消保存图片到相册！',
                      showCancel: false
                    });
                  }
                }
              });
            }
          }
        })
      }
      clearTimeout(timer);
    }, 1000)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getUserInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

    //绘制canvas
    setTimeout(function() {
      if (state == 1) {
        let that = this;
        let promise1 = new Promise(function(resolve, reject) {
          wx.downloadFile({
            url: "https://wenxueshe.oss-cn-shenzhen.aliyuncs.com/wenxiuProve/businessbg.png", //名片背景图
            success: function(sres) {
              //确保图片已下载到本地，再开始进行canvas操作
              if (sres.tempFilePath) {
                let res = sres.tempFilePath
                resolve(res);
              }
            },
            fail: function(fres) {}
          })

        });
        let promise2 = new Promise(function(resolve, reject) {
          wx.downloadFile({
            url: info.image + '', //名片头像
            success: function(sres) {
              //确保图片已下载到本地，再开始进行canvas操作
              if (sres.tempFilePath) {
                let res = sres.tempFilePath
                resolve(res);
              }
            },
            fail: function(fres) {}
          })

        });
        let promise3 = new Promise(function(resolve, reject) {
          //console.log(userCode)
          wx.downloadFile({
            url: info.userCode + '', //小程序码
            success: function(sres) {
              //确保图片已下载到本地，再开始进行canvas操作
              if (sres.tempFilePath) {
                let res = sres.tempFilePath
                resolve(res);
              }
            },
            fail: function(fres) {}
          })
        });
        Promise.all([
          promise1, promise2, promise3
        ]).then(res => {
          // console.log(res)
          const ctx = wx.createCanvasContext('shareCanvas')
          // 底图
          ctx.drawImage(res[0], 0, 0, 750, 1130)
          //头像
          ctx.drawImage(res[1], 176, 80, 400, 450)
          //用户姓名
          ctx.setTextAlign('center')
          ctx.setFillStyle('#333333') // 文字颜色
          ctx.setFontSize(44) // 文字字号
          ctx.fillText(info.name, 220, 600)
          //画小框
          ctx.beginPath()
          ctx.setStrokeStyle('#C78A5C')
          ctx.rect(386, 570, 120, 30)
          ctx.closePath()
          ctx.stroke()
          ctx.beginPath()
          ctx.setStrokeStyle('#C78A5C')
          ctx.rect(280, 570, 100, 30)
          ctx.closePath()
          ctx.stroke()
          //标签内容
          ctx.setTextAlign('center')
          ctx.setFillStyle('#C78A5C') // 文字颜色
          ctx.setFontSize(18) // 文字字号
          ctx.fillText('改眉大师', 326, 590)
          ctx.setTextAlign('center')
          ctx.setFillStyle('#C78A5C') // 文字颜色
          ctx.setFontSize(18) // 文字字号
          ctx.fillText('72变焕眉术', 446, 590)
          //电话及手机号
          ctx.setTextAlign('center')
          ctx.setFillStyle('#666666') // 文字颜色
          ctx.setFontSize(28) // 文字字号
          ctx.fillText(info.city, 240, 680)
          ctx.setTextAlign('center')
          ctx.setFillStyle('#666666') // 文字颜色
          ctx.setFontSize(28) // 文字字号
          ctx.fillText(info.phone, 520, 680)
          const qrImgSize = 160
          ctx.drawImage(res[2], (770 - qrImgSize) / 2, 880, 140, 140)
          ctx.draw(true,
            setTimeout(function() {
              wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: 750,
                height: 1130,
                //绘制canvas的时候用的是px， 这里换算成rpx ，导出后非常清晰
                destWidth: 2250,
                //同上 px 换算成 rpx
                destHeight: 3390,
                canvasId: 'shareCanvas',
                success: function(res) {
                  console.log(res, '保存')
                  savedImgUrl = res.tempFilePath
                }
              })
              clearTimeout();
            }, 2000))
        })
      }
      clearTimeout();
    }, 2000)

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.setData({
      shopUrl: false,
      wenxuesheUrl: false,
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
    if (res.from == "button") {
      //分享为按键中的求助即id=1
      return {
        title: '十九匠大师工厂',
        path: '/pages/information/information',
        success: function(res) {
          wx.showToast({
            title: '转发成功',
            icon: 'success',
            duration: 2000
          })
        },
        fail: function(res) {
          wx.showToast({
            title: '转发失败',
            icon: 'none',
            duration: 2000
          })
        }
      }
    }
  },
  /**
   * 当前是 tab 页时，点击 tab 时触发
   */
  onTabItemTap(item) {
    // console.log(item.index)
    // console.log(item.pagePath)
    // console.log(item.text)
  },
  /**
   * 	页面滚动触发事件的处理函数
   */
  onPageScroll() {

  },
  /**
   * 页面尺寸改变时触发，详见 响应显示区域变化
   */
  onResize() {

  }
})