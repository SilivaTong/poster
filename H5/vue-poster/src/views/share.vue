<template>
  <div>
    <mt-header title="分享海报">
    </mt-header>
    <div class="mui-content">
   
      <!-- 需要截圖的區域 海报内容可以自己用canvas画海报 也可以用css实现 -->
      <div class="content" ref="imageWrapper">
	  <!--网页转化成图片没那么快，我的海报内容比较简单所以直接用背景图占位用（复杂一点的可以先给个loading图占位），图片转化完成后再将元素移除-->
        <img src="../assets/img/bg_fenxiangzhuanqian@2x.png" :style="{width:imgWidth +'px;',height:imgHeight+'px;'}" />
        <div class="qy_code_wrapper" ref="qrCode" > </div>
      </div>
      <!-- 轉化成圖片展示區域 -->
      <div class="container"></div>
      <!-- 底部的按鈕 -->
      <div class="share_tabbar">
        <div
          class="tabbar_item btn"
          data-clipboard-text="http://www.baidu.com"
          @click="copy()"
        >
          <img src="../assets/img/icon_fuzhi@2x.png" alt  />
          <p>复制链接</p>
        </div>
        <div class="tabbar_item" @click="share()">
          <img src="../assets/img/icon_fenxiang@2x.png" alt  />
          <p>我要分享</p>
        </div>
        <div class="tabbar_item" @click="save()">
          <img src="../assets/img/icon_baocun@2x.png" alt  />
          <p>长按保存图片</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import QRCode from "qrcodejs2"; //二维码
import ClipboardJS from "clipboard";//剪切板
import html2canvas from "html2canvas"; //canvas畫圖插件 將網頁轉为图片格式

export default {

  data() {
    return {
      dataURL: "" ,//dataURL是最后转化出来的图片base64地址，放在img标签中即可展示。
      imgHeight:null,//合成图片的高
      imgWidth:null,//合成图片的宽
    };
  },
  created() {},
  mounted() {
  //为了自适应不同手机机型 生成的图片自适应高宽
      this.imgHeight =document.body.scrollHeight ; // 获取DOM高度
      this.imgWidth =  document.body.scrollWidth; // 获取DOM宽度
    this.$nextTick(() => {
      this.initQRCode();
    });
 setTimeout(()=>{
       this.toImage(); //将网页转为图片
    },2000)//使用延時器 是因為生成二維碼需要一定時間  如果不使用二維碼就無法保存到圖片上
 
  },
  methods: {
    initQRCode() {
      //生成二维码
      var qrwidth= this.imgWidth  * 0.28;
      var qrheight=this.imgHeight * 0.17;

      this.qrcode = new QRCode(this.$refs.qrCode, {
        text: "http://www.baidu.com",//二维码生成的内容
        width: qrwidth,
        height: qrheight,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    },

    toImage() {
      //将网页转为图片
    
      let scale = window.devicePixelRatio; // 获取设备像素比
      html2canvas(this.$refs.imageWrapper, {
        useCORS: true,//图片跨域
        scale: scale,
        width: this.imgWidth,
        height: this.imgHeight
      }).then(canvas => {
	  //生成成功后替换截图区域的内容 会出现闪动（微信内部有长按保存图片功能，所以替换你想避免这个闪动问题的话就需要自己手写保存图片功能）
        window.document.querySelector(".content").remove();
        let elemImg = `<img src='${canvas.toDataURL(
          "image/png"
        )}' id='canvas-img' style='height: ${this.imgHeight}px;width:${this.imgWidth}px'/>`;
        window.document.querySelector(".container").innerHTML = elemImg;
       
      });
     
    },
    copy() {
      var clipboard = new ClipboardJS(".btn"); //剪貼板插件 包管理工具 cnpm install clipboard --save
      clipboard.on("success", function(e) {
        mui.toast("复制成功");
      });

      clipboard.on("error", function(e) {
        mui.alert("复制失败请重新点击复制", function() {
          console.log("快看！这里有bug☞");
        });
      });
    },
    share() {},
    save() {}
  }
};
</script>
<style scoped>
.mint-header {
  background: #ffffff;
  color: #232325;
  font-size: 16px;
}
.mint-header-title {
  color: #232325;
  font-size: 16px;
  font-weight: 600;
}
.share_tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #5f35d9;
  font-size: 12px;
  width: 100%;
  padding-top: 10px;
}
.tabbar_item {
  display: flex;
  flex-direction: column;
  align-items: center;
 
}
.tabbar_item img{
   width: 39px;
   height: 39px;
}
.tabbar_item p {
  color: #ffffff;
}


.qy_code_wrapper {
  position: absolute;
  left: 34%;
  top:6%;
  width: 32%;
  height: 18%;
  background: #ffffff;
  border-radius: 5px;
  padding: 8px;
}
.qy_code_wrapper img{
  width: 100%;
  height: 100%;
}
.content {
   position: relative;
}
</style>
