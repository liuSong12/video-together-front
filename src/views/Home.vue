<template>
    <div class="home-container">
        <div class="fa">
            <div class="circle2 same-cicle"></div>
            <div class="circle1 same-cicle"></div>
            <div class="circle3 same-cicle"></div>
            <div class="circle4 same-cicle"></div>
        </div>
        <div class="top-nav">
            <div class="nav-left">
                <img class="ava-img-center" @error="avatarErr" :src="avatar(userStore.user.avatar)" @click="changeInfo">
                <div class="nicknamearea" @click="changeInfo">
                    <div class="say">
                        Hi,{{ userStore.user.userName || '无名' }}
                    </div>
                    <div class="color">
                        欢迎回来
                    </div>
                </div>
            </div>
        </div>

        <div class="tips">
            <div class="tips-item">
                <div class="tips-item-top">
                    {{ videoNum }}
                </div>
                <div class="tips-item-bottom">
                    影视数量
                </div>
            </div>
            <div class="tips-item">
                <div class="tips-item-top">
                    {{ timeFormate(userStore.user.lastTogetherWatch) }}
                </div>
                <div class="tips-item-bottom">
                    上次一起看
                </div>
            </div>
            <div class="tips-item">
                <div class="tips-item-top">
                    {{ timeFormate(userStore.user.lastUpdateTime) }}
                </div>
                <div class="tips-item-bottom">
                    上次操作时间
                </div>
            </div>
        </div>

        <div class="controller-list">
            <van-list class="van-list">
                <van-cell @click='goto("videoList")'>一起看电影</van-cell>
                <van-cell @click='goto("uploadvideo")'>上传电影</van-cell>
                <van-cell @click="goto('videoChatList')">视频通话</van-cell>
                <van-cell @click="goto('login')">退出</van-cell>
            </van-list>
        </div>

    </div>
</template>



<script setup>
import { useRouter } from "vue-router"
import { useUserStore } from "../store/userStore";
import axios from "axios";
import { ref, onMounted } from "vue"
import socketClass from "../utils/socket"

onMounted(() => {
    document.addEventListener('plusready', function () {
        let time = null;
        var webview = window.plus.webview.currentWebview();
        window.plus.key.addEventListener('backbutton', function () {
            webview.canBack(function (e) {
                if (!time) {
                    time = new Date().getTime();
                    plus.nativeUI.toast("再按一次退出应用", {
                        duration: 'short'
                    });
                    setTimeout(function () {
                        time = null;
                    }, 1000);
                } else {
                    if (new Date().getTime() - time < 1000) {
                        window.plus.runtime.quit();
                        webview.close()
                    }
                }
            })
        });
    })
})

let socket = socketClass.getInstance();

const videoNum = ref(0)
const userStore = useUserStore();
let router = useRouter()

socket.waitMessage("call", (data) => {
    router.push({
        name: "videoChat",
        query: {
            info: data.message
        }
    })
})

const avatarErr = () => {
    userStore.setUser({
        ...userStore.user,
        avatar: ''
    })
}

let token = localStorage.getItem("token")
const avatar = (src) => {
    if (!src) {
        return '/avatar.png'
    } else {
        return `/api/user/${src}?authorization=${token}`
    }
}

const timeFormate = (t) => {
    if (!t) return "Invalid Date"
    let t2 = new Date(t)
    let y = (t2.getFullYear() + '').substring(2)
    let m = ((t2.getMonth() + 1) + '').padStart(2, '0')
    let d = (t2.getDate() + '').padStart(2, '0')
    let h = (t2.getHours() + '').padStart(2, '0')
    let mm = (t2.getMinutes() + '').padStart(2, '0')
    return y + "/" + m + "/" + d + " " + h + ":" + mm
}

axios("/api/user/getUser").then(res => {
    if (res.data.code !== 0) return;
    userStore.setUser(res.data.data)
})
axios("/api/getVideoList").then(res => {
    videoNum.value = res.data.length
})

const changeInfo = () => {
    router.push("userChange")
}


const goto = (route) => {
    router.push(route)
}
</script>

<style scoped lang="scss">
.home-container {
    height: 100vh;
    background-color: #f3f3f3;
}

.fa {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;

    .same-cicle {
        border-radius: 50%;
        position: absolute;
        top: 0;
        left: 0;
    }

    .circle1 {
        background: radial-gradient(circle at center, rgba(248, 91, 0, 0.808) 0, #f3f3f3 100%);
        width: 800px;
        height: 800px;
        transform: translate(6%, -19%);
        z-index: 1;
    }

    .circle2 {
        background: radial-gradient(circle at center, rgba(0, 116, 248, 0.808) 0, #ffffff 100%);
        width: 300px;
        height: 300px;
        transform: translate(75%, 174%);
        z-index: 2;
    }

    .circle3 {
        background: radial-gradient(circle at center, rgba(117, 0, 250, 0.808) 0, #ffffff 100%);
        width: 600px;
        height: 600px;
        transform: translate(-46%, 63%);
    }

    .circle4 {
        background: radial-gradient(circle at center, rgba(255, 0, 106, 0.808) 0, #ffffff 100%);
        width: 500px;
        height: 500px;
        transform: translate(-59%, -15%);
    }
}

.van-list {

    .van-cell {
        padding: 15px;

        :deep(.van-cell__value) {
            text-align: left;
            color: #515151;
            font-size: 15px;
        }
    }
}


.controller-list {
    z-index: 10;
    position: relative;
    margin: 20px 10px;
    background-color: white;
    padding: 0 15px;
    border-radius: 7px;
}


.tips {
    z-index: 10;
    position: relative;
    display: flex;
    justify-content: space-around;
    align-items: center;

    .tips-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .tips-item-top {
            font-size: 18px;
            font-weight: 600;
        }

        .tips-item-bottom {
            color: #515151;
            font-size: 13px;
        }
    }
}


.top-nav {
    z-index: 10;
    height: 100px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;

    .nav-left {
        display: flex;
        flex: 1;
        padding-left: 15px;

        //头像
        .ava-img-center {
            object-fit: cover;
            margin-right: 20px;
            width: 45px;
            height: 45px;
            border-radius: 50%;
        }

        .nicknamearea {
            display: flex;
            flex-direction: column;

            .say {
                font-size: 20px;
                font-weight: 600;
                display: flex;
                align-items: baseline;
            }
        }
    }
}
</style>