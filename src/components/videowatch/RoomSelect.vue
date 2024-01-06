<template>
    <div>
        <van-cell-group class="topcell">
            <van-field v-model="roomStore.roomId" @input="inputHandler" type="digit" label="房间号" class="roomNum"
                placeholder="请输入数字房间号" :maxlength="4" />
        </van-cell-group>
        <van-list>
            <van-cell v-for="item in roomStore.roomUsers" :key="item">
                <div class="user-info">
                    <div class="avatar">
                        <img :src="avatar(item.avatar)"/>
                    </div>
                    <div class="userId">
                        id：{{ item.id }}
                    </div>
                    <div class="userName">
                        {{ item.userName || "无名" }}
                    </div>
                </div>
            </van-cell>
        </van-list>
        <van-empty v-if="roomStore.roomUsers.length === 0" description="未加入房间" />
    </div>
</template>

<script setup>
import axios from "axios";
import { useRoomStore } from "../../store/roomStore"

let emites = defineEmits(["updateMsg"])
const roomStore = useRoomStore()
let token = localStorage.getItem("token")
const avatar = (src) =>{
    if(!src){
        return '/avatar.png'
    }else{
        return `/api/user/${src}?authorization=${token}` 
    }
}
let roomId;
const inputHandler = () => {
    if (roomStore.roomId.length === 4) {
        //加入
        roomId = roomStore.roomId
        axios(`/api/user/joinRoom?roomId=${roomStore.roomId}`).then(res => {
            if (res.data.code !== 0) return;
            emites("updateMsg")
        })
    }else{
        //退出
        if(!roomId) return;
        axios(`/api/user/leaveRoom?roomId=${roomId}`).then(res => {
            if (res.data.code !== 0) return;
            roomStore.setRoomUsers([])
        })
    }

}



</script>


<style scoped lang="scss">
.user-info{
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    height: 50px;
    border-radius: 3px;
    background-color: #f1f1f1;
    padding: 5px;
    margin: 5px;
    .userName{

    }
    .userId{
        margin-right: 10px;
    }
    .avatar{
        display: flex;
        justify-content: center;
        align-items: center;
        img{
            width:40px;
            height:40px;
            border-radius:50%;
            margin-right: 10px;
        }
    }
}
.topcell {
    margin: 5px;
}

.roomNum {
    background-color: #ededee;
    border-radius: 3px;
    padding: 5px;
    line-height: 45px;
    font-size: 20px;


    :deep(.van-field__control) {
        background-color: white;
        border-radius: 5px;
        padding-left: 15px;
        height: 45px;
    }
}

:deep(.van-cell__title) {
    text-align: center;
}

:deep(.van-field__label) {
    text-align: center;
    width: 150px;
}
</style>