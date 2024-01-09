<template>
    <div ref="chatPanel" style="padding-bottom: 100px;">

        <div v-for="item in messageStore.messageList">
            <div class="message-div" v-if="item.from !== userStore.user?.id">
                <div class="avatar">
                    <img :src="avatar(item.avatar)" />
                </div>
                <div class="info">
                    <span class="name-time">
                        <span style="margin-right: 10px;">{{ item.userName || "无名" }}</span>
                        <span>{{ timeParse(item.sendTime) }}</span>
                    </span>
                    <span class="message" style="background-color: white;color: black;">
                        {{ item.message }}
                    </span>
                </div>
            </div>
            <div class="message-div" style="justify-content: right;" v-else>
                <div class="info" style="align-items: end;">
                    <span class="name-time" style="text-align: right;">
                        <span>{{ timeParse(item.sendTime) }}</span>
                        <span style="margin-left: 10px;">{{ item.userName || "无名" }}</span>
                    </span>
                    <span class="message">
                        {{ item.message }}
                    </span>
                </div>
                <div class="avatar">
                    <img :src="avatar(item.avatar)" />
                </div>
            </div>
        </div>
        <van-empty v-if="messageStore.messageList.length === 0" description="暂无新消息" />

        <div class="footer">
            <div class="footer-content">
                <div class="textarea-div">
                    <div ref="hidediv" class="hide-div"></div>
                    <textarea v-model="text" @input="inputHandler" class="textarea"></textarea>
                </div>
                <van-button @click="sendMsg" class="send-btn" type="success">发送</van-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, nextTick} from "vue"
import socketClass from "../../utils/socket"
import { useRoomStore } from "../../store/roomStore"
import { useUserStore } from "../../store/userStore"
import { useMessageStore } from "../../store/ChatMessageStore"
const messageStore = useMessageStore();
const userStore = useUserStore();
const roomStore = useRoomStore();

let socket = socketClass.getInstance();
const text = ref("")
const hidediv = ref(null)
const chatPanel = ref()

const emites = defineEmits(["scroll"])

let token = localStorage.getItem("token")
const avatar = (src) => {
    if (!src) {
        return '/avatar.png'
    } else {
        return `/api/user/${src}?authorization=${token}`
    }
}

const timeParse = (time) => {
    return new Date(Number(time)).toLocaleString()
}

socket.waitMessage("chat", (data) => {
    if (!messageStore.isEnterChatPage) {
        messageStore.addNewMsg()
    }
    let msg = data.message
    addMsg(msg)
})

function addMsg(msg) {
    if (msg) {
        messageStore.addMsg(msg)
        nextTick(() => {
            emites("scroll", chatPanel.value.scrollHeight + 50)
        })
    } else {
        messageStore.addMsg({
            message: text.value,
            from: userStore.user.id,
            avatar: userStore.user.avatar,
            sendTime: new Date().getTime(),
            userName: userStore.user.userName
        })
        nextTick(() => {
            emites("scroll", chatPanel.value.scrollHeight + 50)
        })
    }
}

const sendMsg = () => {
    if (text.value.trim() === "") return;
    if (roomStore.roomId) {
        let data = {
            from: userStore.user?.id,
            avatar: userStore.user?.avatar || null,
            message: text.value,
            sendTime: new Date().getTime() + ""
        }
        socket.sendMsg({ message: data, type: "chat" })
    }
    addMsg()
    text.value = ""
    hidediv.value.innerHTML = ""
}
const inputHandler = () => {
    hidediv.value.innerHTML = text.value
}
</script>


<style scoped lang="scss">
.message-div {
    display: flex;
    margin-top: 15px;

    .avatar {
        img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
        }

        margin: 10px;
    }

    .info {
        display: flex;
        flex-direction: column;
        max-width: 60%;

        .name-time {
            font-size: 12px;
            color: #797979;
        }

        .message {
            background-color: rgb(94, 94, 173);
            color: white;
            padding: 5px 10px;
            text-align: left;
            border-radius: 5px;
            line-height: 25px;
            margin-top: 5px;
            width: fit-content;
        }
    }
}



.footer {
    width: 100%;
    position: fixed;
    bottom: 0;
    background-color: rgb(243, 243, 243);

    .footer-content {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        width: 100%;
        align-items: center;

        .textarea-div {
            flex: 1;
            margin-right: 10px;
            position: relative;
            line-height: 30px;
            font-size: 20px;

            .hide-div {
                visibility: hidden;
                min-height: 32px;
                width: 100%;

            }

            .textarea {

                height: 100%;
                position: absolute;
                top: 0;
                width: 100%;
                margin-right: 5px;
                padding: 2px 5px;
                border-radius: 7px;
            }
        }

        .send-btn {
            height: 30px;
            width: 60px;
        }
    }
}
</style>