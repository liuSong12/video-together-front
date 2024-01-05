<template>
    <div>
        <van-form @submit="onSubmit">
            <van-field v-model="data.phone" name="phone" label="手机号" placeholder="手机号"
                :rules="[{ required: true, message: '请填写手机号' }]" type="number" />
            <div style="margin: 16px;">
                <van-button round block type="info" native-type="submit">提交</van-button>
            </div>
        </van-form>

    </div>
</template>

<script setup>
import { reactive } from 'vue';
import axios from "axios"
import {useRouter} from "vue-router"

const router = useRouter()
const data = reactive({
    phone: "",
})

function onSubmit(values) {
    console.log(values.phone)
    axios.post("/api/user/login",{phone:values.phone}).then(res=>{
        console.log(res.data)
        if(res.data.code!==0) return;
        router.push("/")
    })
}
</script>