<template>
    <div>
        <van-nav-bar title="上传视频" left-text="返回" left-arrow fixed @click-left="router.back()" />
        <div class="uploader">
            <Video :videoSrc="fileLocalUrl" :videoName="videoName" v-if="isShow" ref="videoRef" class="uploader-video" />
            <div style="width: 100%;margin-top: 10px;" v-for="item in progressStore.progresses">
                <van-progress :percentage="item.progress" :pivot-text="fileName(item.filename, item.progress)"
                    stroke-width="12" :key="item.hash" style="width: 100%;" />
            </div>
            <div class="uploader-model">
                <input type="file" ref="inputRef" @input="onInputChange" class="uploader-input" accept="video/mp4" />
                <div class="uploader-model-text">选择mp4结尾的视频</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick, computed, onUnmounted,onMounted } from 'vue';
import { useRouter } from "vue-router"
import Video from "../components/Video.vue"
import upload from "../utils/upload"
import { useProgressStore } from "../store/uploadStore"
import { showNotify } from 'vant';
import socketClass from "../utils/socket"
let socket = socketClass.getInstance();

const progressStore = useProgressStore()
const router = useRouter()
onMounted(() => {
    document.addEventListener('plusready', function () {
        var webview = window.plus.webview.currentWebview();
        window.plus.key.addEventListener('backbutton', function () {
            webview.canBack(function (e) {
                router.push("home")
            })
        });
    })
})


const videoRef = ref(null);
const inputRef = ref(null);
const isShow = ref(false);
const fileLocalUrl = ref(null);
const videoName = ref(null);


const fileName = computed(() => (name, progress) => {
    let n = name.substring(0, 8) + progress + "%.."
    if (Number(progress) === 100) {
        return n + "正在ts切片.."
    }
    return n
})

onUnmounted(() => {
    socket.canclelWaitMsg("completeUpload")
    socket.canclelWaitMsg("completeSlice")
})

socket.waitMessage("completeUpload", (data) => {
    if (!checkHash(data)) return;
    showNotify({
        //这里合并切片好了，但是没有ffmpeg处理
        message: "可以边看边上传了",
        type: 'success'
    });
    setTimeout(() => {
        fileLocalUrl.value = null
        videoName.value = data.message
        nextTick(() => {
            videoRef.value.initVideo()
        })
    }, 2000);
})

socket.waitMessage("completeSlice", (data) => {
    if (!checkHash(data)) return;
    progressStore.removeProgress(data.message)
    //这里合并切片好了，ffmpeg处理也好了
    showNotify({
        message: "完成上传与切片",
        type: 'success'
    });
})

function checkHash(data) {
    let flag = false
    for (let i = 0; i < progressStore.progresses.length; i++) {
        if (progressStore.progresses[i].hash === data.message) {
            flag = true
            break;
        }
    }
    return flag
}


const onInputChange = () => {
    const file = inputRef.value.files[0];
    if (!file) return;
    isShow.value = true;
    fileLocalUrl.value = URL.createObjectURL(file);
    nextTick(() => {
        videoRef.value.initLocalVideo()
    })
    //这里开始上传视频
    upload(file).then(res => {
        //在这里只是上传切片，还没有合并好
        showNotify({
            message: res.message,
            type: res.type
        });
        if (res.message === "已经上传过了") {
            fileLocalUrl.value = null
            videoName.value = res.hash
            nextTick(() => {
                videoRef.value.initVideo()
            })
        }
    }).catch(err => {
        showNotify({
            message: err.message || "未知错误",
            type: err.type
        });
    })
}





</script>


<style scoped lang="scss"> 

 :deep(.van-progress__pivot) {
     overflow: hidden;
     //文本溢出隐藏
     text-overflow: ellipsis;
     white-space: nowrap;
 }

 .uploader {
     margin-top: 50px;
     width: 100vw;
     display: flex;
     flex-direction: column;
     justify-content: center;
     align-items: center;

     .uploader-video {
         width: 100%;
         height: 200px;
     }

     .uploader-model {
         background-color: rgba(0, 0, 0, .1);
         width: 100%;
         height: 200px;
         cursor: pointer;
         border: 3px dashed white;
         margin: 5px;
         margin-top: 10px;
         position: relative;

         .uploader-input {
             width: 100%;
             height: 100%;
             opacity: 0;
         }

         .uploader-model-text {
             position: absolute;
             top: 50%;
             left: 50%;
             transform: translate(-50%, 30px);
             font-size: 20px;
             color: white;
             font-family: 'Courier New', Courier, monospace;
         }

     }

     .uploader-model::before {
         content: "+";
         position: absolute;
         font-family: 'Courier New', Courier, monospace;
         left: 50%;
         top: 0;
         pointer-events: none;
         transform: translate(-50%, -10px);
         color: white;
         font-size: 150px;
         text-align: center;
         z-index: 1;

     }
 }
</style>