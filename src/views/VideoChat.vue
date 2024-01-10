<template>
    <div class="video-div">
        <video @click="tagger(true)" v-if="localVideoIsShow" :class="maxIsLocal ? 'full-screen' : 'small-video'"
            ref="videoLocal"></video>
        <video @click="tagger(false)" v-if="remoteVideoIsShow" :class="maxIsLocal ? 'small-video' : 'full-screen'"
            ref="videoRemote"></video>
        <div class="btns">
            <van-button @click="btnClick(true)" round type="success" v-if="btnAcceptIsShow" ref="btnAccept"
                class="accept-video">
                <van-icon name="phone" />
            </van-button>
            <van-button @click="btnClick(false)" round type="danger" v-if="btnCloseIsShow" ref="btnClose"
                class="close-video">
                <van-icon name="phone" />
            </van-button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import socketClass from "../utils/socket"
import { showToast } from "vant"
import { showNotify, closeNotify } from 'vant';


let socket = socketClass.getInstance();

const route = useRoute()
const router = useRouter()

onMounted(() => {
    document.addEventListener('plusready', function () {
        let time = null;
        var webview = window.plus.webview.currentWebview();
        window.plus.key.addEventListener('backbutton', function () {
            webview.canBack(function (e) {
                if (!time) {
                    time = new Date().getTime();
                    plus.nativeUI.toast("再按一次挂断视频", {
                        duration: 'short'
                    });
                    setTimeout(function () {
                        time = null;
                    }, 1000);
                } else {
                    if (new Date().getTime() - time < 1000) {
                        closeNotify()
                        router.back()
                        socket.sendMsg({ type: "hangup", message: { id: to }, noDebouce: true })
                    }
                }
            })
        });
    })
})

const maxIsLocal = ref(true)
const videoLocal = ref(null)
const videoRemote = ref(null)
const btnAccept = ref(false)
const btnClose = ref(false)
const btnAcceptIsShow = ref(false)
const btnCloseIsShow = ref(false)
const localVideoIsShow = ref(false)
const remoteVideoIsShow = ref(false)
let caller = false, called = false, calling = false, localStream, remoteStream, localPeer, remotePeer;

let toId = route.query.toId
let info = route.query.info

const tagger = (flag) => {
    maxIsLocal.value = flag
}

socket.waitMessage("accept", async (data) => {
    remoteVideoIsShow.value = true
    localPeer = new RTCPeerConnection()
    localPeer.addStream(localStream)
    localPeer.onicecandidate = (e) => {
        if (e.candidate) {
            socket.sendMsg({ type: "candidate", message: { id: toId, candidate: e.candidate, noDebouce: true } })
        }
    }
    localPeer.onaddstream = (e) => {
        remoteStream = e.stream
        videoRemote.value.srcObject = remoteStream
        videoRemote.value.play()
    }
    let offer = await localPeer.createOffer()
    await localPeer.setLocalDescription(offer)
    socket.sendMsg({ type: "offer", message: { id: toId, offer }, noDebouce: true })
})

socket.waitMessage("offer", async (data) => {
    let fromUser = JSON.parse(info).fromUser
    let msg = JSON.parse(data.message)
    remoteVideoIsShow.value = true
    remotePeer = new RTCPeerConnection()
    remotePeer.addStream(localStream)
    remotePeer.onicecandidate = (e) => {
        if (e.candidate) {
            socket.sendMsg({ type: "candidate", message: { id: fromUser.id, candidate: e.candidate, noDebouce: true } })
        }
    }
    remotePeer.onaddstream = (e) => {
        remoteStream = e.stream
        videoRemote.value.srcObject = remoteStream
        videoRemote.value.play()
    }
    await remotePeer.setRemoteDescription(msg.offer)
    let answer = await remotePeer.createAnswer()
    await remotePeer.setLocalDescription(answer)
    socket.sendMsg({ type: "answer", message: { id: fromUser.id, answer }, noDebouce: true })
})

socket.waitMessage("candidate", async (data) => {
    let msg = JSON.parse(data.message)
    if (caller) {
        localPeer.addIceCandidate(msg.candidate)
    } else {
        remotePeer.addIceCandidate(msg.candidate)
    }
})

socket.waitMessage("answer", async (data) => {
    let msg = JSON.parse(data.message)
    localPeer.setRemoteDescription(msg.answer)
})

socket.waitMessage("hangup", async () => {
    router.back()
})

const btnClick = async (flag) => {
    let to;
    if (toId) {
        to = toId
    } else {
        to = JSON.parse(info).fromUser.id
    }
    if (flag) {
        //接听
        btnAcceptIsShow.value = false
        socket.sendMsg({ type: "accept", message: { id: to }, noDebouce: true })
        closeNotify()
    } else {
        //挂断
        closeNotify()
        router.back()
        socket.sendMsg({ type: "hangup", message: { id: to }, noDebouce: true })
    }
}
onUnmounted(() => {
    closeNotify()
    let to;
    if (toId) {
        to = toId
    } else {
        to = JSON.parse(info).fromUser.id
    }
    socket.sendMsg({ type: "hangup", message: { id: to }, noDebouce: true })

    localStream && localStream.getTracks().forEach(item => {
        item.stop()
    })
    remoteStream && remoteStream.getTracks().forEach(item => {
        item.stop()
    })
    caller = false, called = false, calling = false, localStream = null, remoteStream = null, localPeer = null, remotePeer = null;
})

onMounted(init)
async function init() {
    localVideoIsShow.value = true
    calling = true
    if (toId) {
        //发起
        caller = true
        btnCloseIsShow.value = true
        socket.sendMsg({ type: "call", message: { id: toId } })
    } else {
        let fromUser = JSON.parse(info).fromUser
        //接收
        showNotify({
            type: 'success',
            message: (fromUser.userName || "无名") + "  邀请您视频通话",
            duration: 0
        });
        btnCloseIsShow.value = true
        btnAcceptIsShow.value = true
        called = true
    }
    try {
        localStream = await getMediaStream()
        videoLocal.value.srcObject = localStream
        videoLocal.value.play()
    } catch (error) {
        showToast("摄像头不可用")
    }
}


function getMediaStream() {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            resolve(stream)
        }).catch(err => {
            reject(err)
        })
    })
}


</script>

<style scoped lang="scss">
.hide {
    display: none;
}

.btns {
    button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        text-align: center;
        line-height: 35px;
        padding: 0;
        margin: 0;
        font-size: 35px;
    }

    .accept-video {
        margin-right: 20px;
    }

    position: absolute;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
}

.full-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(177, 175, 175, 0.5);
}

.small-video {
    position: absolute;
    top: 0;
    right: 0;
    width: 150px;
    // height: 200px;
    background-color: rgba(177, 175, 175, 0.5);
    z-index: 10;
}

.video-div {
    width: 100vw;
    height: 100vh;
    position: relative;
}
</style>