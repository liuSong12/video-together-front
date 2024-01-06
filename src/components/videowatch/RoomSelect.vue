<template>
    <div>
        <van-cell-group class="topcell">
            <van-field v-model="roomStore.roomId" @input="inputHandler" type="digit" label="房间号" class="roomNum"
                placeholder="请输入数字房间号" :maxlength="4" />
        </van-cell-group>
        <UserList :userList="roomStore.roomUsers"/>
        <van-empty v-if="roomStore.roomUsers.length === 0" description="未加入房间" />
    </div>
</template>

<script setup>
import axios from "axios";
import { useRoomStore } from "../../store/roomStore"
import UserList from "../UserList.vue";

let emites = defineEmits(["updateMsg"])
const roomStore = useRoomStore()

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