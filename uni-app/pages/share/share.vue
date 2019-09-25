<template>
	<view>
		<canvas :style="{width:imgWidth+'px',height:imgHeight+'px'}" canvas-id='myCanvas'></canvas>
		<view class="qrimg">
			<tki-qrcode ref="qrcode" :cid="cid" :val="val" :size="size" :unit="unit" :icon="icon" :iconSize="iconsize" 
			 @result="qrR" />
		</view>
		<view class="share_tabbar">
			<view class="tabbar_item" @click="sharurl">
				<image src="../../static/img/icon_fuzhi@2x.png" alt style="width: 78upx;height: 78upx;" />
				<view>复制链接</view>
			</view>
			<view class="tabbar_item" @click="share">
				<image src="../../static/img/icon_fenxiang@2x.png" alt style="width: 78upx;height: 78upx;" />
				<view>我要分享</view>
			</view>
			<view class="tabbar_item" @click="save">
				<image src="../../static/img/icon_baocun@2x.png" alt style="width:78upx;height: 78upx;" />
				<view>保存到相册</view>
			</view>
		</view>
	</view>
</template>
<script>
	import tkiQrcode from "@/components/tki-qrcode/tki-qrcode.vue"
	export default {
		components: {
			tkiQrcode
		},
		data() {
			return {
				providerList:[],	
				bgUrl: '../../static/img/bg_fenxiangzhuanqian@2x.png',//分享背景图  注意不能使用网络图片  否则最后无法将canvas转为图片格式
				cid: '1',//二维码标识
				val: 'http://www.baidu.com',//二维码需要生成的内容 
				size: 240,//生成的二维码大小
				unit: 'upx',//
				icon: '../static/img/logo.png',//二维码图标URL（必须是本地图片，网络图需要先下载至本地）
				iconsize: 30,//二维码图标大小  注意此大小不会跟随二维码size 动态变化，设置时需注意大小，不要太大，以免无法识别
				src: '', // 二维码生成后的图片地址或base64
				saveImg: '' ,//将canvas转成为图片
				imgHeight:null,//canvas所画海报展示的高度
				imgWidth:null,//canvas所画海报展示的宽度
				canvasImgHeight:null,//canvas所画海报转成实际图片的高度
				canvasImgWidth:null,//canvas所画海报转成实际图片的宽度

			}
		},
		onLoad() {
			this.version = plus.runtime.version;
			uni.getProvider({
				service: 'share',
				success: (e) => {
					let data = [];
					for (let i = 0; i < e.provider.length; i++) {
						switch (e.provider[i]) {
							case 'weixin':
								data.push({
									name: '分享到微信好友',
									id: 'weixin'
								})
								data.push({
									name: '分享到微信朋友圈',
									id: 'weixin',
									type: 'WXSenceTimeline'
								})
								break;
							case 'qq':
								data.push({
									name: '分享到QQ',
									id: 'qq'
								})
								break;
							default:
								break;
						}
					}
					this.providerList = data;
				},
				fail: (e) => {
					console.log('获取登录通道失败'+ JSON.stringify(e));
				}
			});
		},
		mounted() {
			try{
				const res=uni.getSystemInfoSync();//异步获取设备信息
				this.imgWidth=res.windowWidth;//获取设备可使用设备宽度
				this.imgHeight=res.windowHeight;//获取设备可使用窗口高度
				this.canvasImgHeight=res.screenHeight;//获取设备屏幕高度
				this.canvasImgWidth=res.screenWidth;//获取设备屏幕宽度
			}catch(e){
				//TODO handle the exception
			}
			this.$refs.qrcode._makeCode() //生成二维码
		},
		methods: {
			qrR(result) {
				this.src = result//展示二维码图片地址
				
				//创建canvas
				const ctx = uni.createCanvasContext('myCanvas')
				ctx.drawImage(this.bgUrl, 0, 0, this.imgWidth, this.imgHeight)//背景图
				ctx.drawImage(this.src, 128, 40, 118, 118)//二维码
				ctx.draw(true, (ret) => {
					//将canvas转成图片
					uni.canvasToTempFilePath({
						canvasId: 'myCanvas',
						quality: 1,
						width: this.canvasImgWidth,
						height: this.canvasImgHeight,
						success: function(res) {
							console.log('成功了')
							// 在H5平台下，tempFilePath 为 base64
							this.saveImg = res.tempFilePath
								console.log(res.tempFilePath)
						},
						fail:function(err){
							console.log('canvas 编译成图片失败',err)
						}
					},this)
				})
			},
			//复制分享链接
			sharurl() {
				uni.setClipboardData({
					data: 'http://www.baidu.com',//用户需要复制的内容
					success: function() {
						//console.log('success');

					}
				});
			},
			//保存图片到相册
			save() {
				uni.showActionSheet({
					itemList: ['保存图片到相册'],
					success: () => {
						plus.gallery.save(this.saveImg, function() {
							uni.showToast({
								title:'保存成功',
								icon:'none'
							})
						}, function() {
							uni.showToast({
								title:'保存失败，请重试！',
								icon:'none'
							})
						});
						
					}
				})
			},
			share(e) {
				if (this.providerList.length === 0) {
					uni.showModal({
						title: '当前环境无分享渠道!',
						showCancel: false
					})
					return;
				}
				let itemList = this.providerList.map(function(value) {
					return value.name
				})

				console.log(itemList)

				uni.showActionSheet({
					itemList: itemList,
					success: (res) => {
						console.log(this.providerList[res.tapIndex].id)
						if (this.providerList[res.tapIndex].id == 'qq') {
							this.type = 1
						} else {
							this.type = 0
						}
						uni.share({
							provider: this.providerList[res.tapIndex].id,
							scene: this.providerList[res.tapIndex].type && this.providerList[res.tapIndex].type === 'WXSenceTimeline' ?
								'WXSenceTimeline' : "WXSceneSession",
							type: this.type,
							title: '百度',
							summary: '有问题上百度',
							imageUrl: '/static/img/logo.png',
							href: "https://www.baidu.com",
							success: (res) => {
								console.log("success:" + JSON.stringify(res));
							},
							fail: (e) => {
								uni.showModal({
									content: e.errMsg,
									showCancel: false
								})
							}
						});
					}
				})




			},
		}
	}
</script>
<style>
	.share_bg {
		height: 1200upx;
		width: 750upx;
		position: relative;
	}

	.share_tabbar {
		position: fixed;
		bottom: 0;
		left: 0;
		display: flex;
		justify-content: space-around;
		align-items: center;
		background: #5f35d9;
		font-size: 24upx;
		width: 100%;
		padding-top: 20upx;
	}

	.tabbar_item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.tabbar_item view {
		color: #ffffff;
	}

	.qrimg {
		position: fixed;
		bottom: -500upx;
		left: 34%;

	}
</style>
