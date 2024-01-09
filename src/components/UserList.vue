<template>
    <div>
        <van-list>
            <van-cell class="van-cell" v-for="item in props.userList" :key="item">
                <div class="user-info">
                    <div class="avatar">
                        <img :src="avatar(item.avatar)" />
                    </div>
                    <div class="userId">
                        id：{{ item.id }}
                    </div>
                    <div class="userName">
                        {{ item.userName || "无名" }}
                    </div>
                </div>
                <div @click="handlerClick(item)">
                    <van-icon style="font-size: 25px;color: rgb(223, 53, 53);" name="phone" />
                </div>
            </van-cell>
        </van-list>
    </div>
</template>


<script setup>
import { useRouter } from "vue-router"
import {useUserStore} from "../store/userStore"
import {showToast} from "vant"
const userStore = useUserStore()
const router = useRouter()
const props = defineProps({
    userList: {
        default: [],
        type: Array
    }
})
const handlerClick = (item) => {
    if(item.id === userStore.user.id){
        showToast("不能和自己聊天")
        return;
    }
    router.push({
        name: "videoChat",
        query: {
            toId: item.id,
        }
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
</script>


<style scoped lang="scss">
:deep(.van-cell__value) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;
    border-radius: 3px;
    background-color: #f1f1f1;
    padding: 15px;
    margin: 5px;
    width: 90%;
}

.user-info {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex: 1;

    .userId {
        margin-right: 10px;
    }

    .avatar {
        display: flex;
        justify-content: center;
        align-items: center;

        img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            margin-right: 10px;
        }
    }
}</style>