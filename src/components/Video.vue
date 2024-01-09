<template>
    <div class="video-container">
        <video id="videotogether" class="video-js vjs-default-skin" controls preload="none" x5-playsinline="" playsinline=""
            webkit-playsinline="" poster="" x-webkit-airplay="allow" muted>
        </video>
        <canvas v-if="isShow" class="localHide"  ref="localCanvas" ></canvas>
        <video v-if="isShow" class="localHide" ref="hidevideo"></video>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import videoJs from "video.js"
import 'video.js/dist/video-js.css'
import socketClass from "../utils/socket"
import { useRoomStore } from "../store/roomStore"
import {useMessageStore} from '../store/ChatMessageStore'
import axios from 'axios'
const messageStore = useMessageStore()
let socket = socketClass.getInstance();

const roomStore = useRoomStore()
const props = defineProps({
    videoName: String,
    videoSrc: String,
    videoTogether: Boolean
})

let player;
const localCanvas = ref(null)
const hidevideo = ref(null)
let localVideoDom;
let isShow = ref(true)


const myVideoOptions = {
    bigPlayButton: true, // 是否显示播放按钮（这个播放按钮默认会再左上方，需用CSS设置居中）
    textTrackDisplay: true,
    preload: true,
    posterImage: true,
    errorDisplay: true,
    fluid: true,//自适应宽高
    controlBar: true,
    autoplay: false, // 不设置自动播放，若未true，则无法看到视频海报图片
    controls: true, //是否显示底部控制栏：true/false
    width: document.documentElement.clientWidth, //视频播放器显示的宽度
    // height: 1300, //视频播放器显示的高度
    // controlBar: {
    //     currentTimeDisplay: true,
    //     timeDivider: true,
    //     durationDisplay: true,
    //     remainingTimeDisplay: true,
    //     volumePanel: {
    //         inline: true
    //     },
    //     children: [{
    //         name: 'playToggle'
    //     }, // 播放/暂停按钮
    //     {
    //         name: 'currentTimeDisplay'
    //     }, // 视频当前已播放时间
    //     {
    //         name: 'progressControl'
    //     }, // 播放进度条
    //     {
    //         name: 'durationDisplay'
    //     }, // 视频播放总时间
    //     {
    //         // 倍速播放
    //         name: 'playbackRateMenuButton',
    //         playbackRates: [0.5, 1, 1.5, 2]
    //     },
    //     {
    //         name: 'volumePanel', // 音量控制
    //         inline: false // 不使用水平方式
    //     },
    //     {
    //         name: 'FullscreenToggle'
    //     }
    //     ]
    // }
}

onMounted(initVideo)
let token = localStorage.getItem("token")
function initVideo() {
    if (!player) {
        player = videoJs("videotogether", myVideoOptions);
    }
    player.on("fullscreenchange", (e) => {
        messageStore.setIsFull()
        e.srcElement.childNodes[0].style.width = '100%'
        e.srcElement.childNodes[0].style.height = '100%'
    })
    waitMessage()
    if (!props.videoName) return;
    isShow.value = false
    let i = props.videoName?.lastIndexOf(".") || -1
    let videoName;
    if (!i == -1) {
        videoName = props.videoName.substring(0, i)
    } else {
        videoName = props.videoName
    }
    player.src({
        src: `/api/startView?videoName=${videoName}&authorization=${token}`,
        type: "application/x-mpegURL" // 告诉videojs,这是一个hls流
    })
    player.poster(`/api/getPoster?posterName=${videoName}&authorization=${token}`)
}

function initLocalVideo() {
    if (!props.videoSrc) return;
    isShow.value = true
    nextTick(() => {
        localVideoDom = player.el_.childNodes[0]
        hidevideo.value.src = props.videoSrc;
        hidevideo.value.muted = true
        hidevideo.value.play()
        hidevideo.value.addEventListener("loadedmetadata", () => {
            let duration = hidevideo.value?.duration
            if (!isNaN(duration)) {
                hidevideo.value.currentTime = Math.floor(duration / 3)
                setTimeout(() => {
                    if (!isShow.value) return;
                    const { width, height } = hidevideo.value?.getBoundingClientRect()
                    localCanvas.value.width = width
                    localCanvas.value.height = height
                    const ctx = localCanvas.value.getContext("2d");
                    ctx.drawImage(hidevideo.value, 0, 0, width, height)
                    let v = localCanvas.value.toDataURL("image/png")
                    localVideoDom.src = props.videoSrc;
                    player.poster(v)
                    localVideoDom.poster = v
                    isShow.value = false
                }, 1000);

            };
        })
    })

}


defineExpose({
    initLocalVideo,
    initVideo,
    waitMessage
})

function waitMessage() {
    if (!props.videoTogether || !props.videoTogether) return
    let currentTime = 0
    player.on("timeupdate", () => {
        if (Math.abs(player.currentTime() - currentTime) > 6) {
            socket.sendMsg({
                type: "timeupdate",
                message: player.currentTime()
            })
        }
        currentTime = player.currentTime()
    })
    player.on("play", () => {
        socket.sendMsg({
            type: "play",
        })
    })
    player.on("pause", () => {
        socket.sendMsg({
            type: "pause",
        })
    })
    //=======================
    socket.waitMessage("joinRoom", (data) => {
        roomStore.setRoomUsers(JSON.parse(data.message).users)
        axios("/api/user/watchTogether")
    })
    socket.waitMessage("timeupdate", (data) => {
        if (Math.abs(player.currentTime() - data.message) > 6) {
            player.currentTime(data.message)
            player.play()
        }
    })
    socket.waitMessage("synchronizeTime", () => {
        socket.sendMsg({
            type: "synchronizeTimeAsRoomHost",
            message: {
                currentTime: player.currentTime(),
                src: props.videoName
            }
        })
    })
    socket.waitMessage("synchronizeTimeAsRoomHost", (data) => {
        player.src({
            src: `/api/startView?videoName=${data.message.src}&authorization=${token}`,
            type: "application/x-mpegURL" // 告诉videojs,这是一个hls流
        })
        player.currentTime(data.message.currentTime)
        player.play()
    })
    socket.waitMessage("play", () => {
        player.play()
    })
    socket.waitMessage("pause", () => {
        player.pause()
    })
}

onBeforeUnmount(() => {
    // 销毁时释放资源
    player?.dispose()
    messageStore.setIsFull(false)
})

</script>

<style scoped lang="scss">
:deep(.videotogether-dimensions){
    height: 200px;
}
.localHide {
    // display: none;
    position: absolute;
    opacity: 0;
    top: 0;
    left: 0;
}

.video-container {
    width: 100%;
}
// :deep(.vjs-poster){
//     height: 200px;
// }

:deep(.video-js) {
    // touch-action: pan-y;
    height: 200px !important;
    padding: 0 !important;

    .vjs-tech {
        width: 100%;
        height: 200px;
    }
}
</style>