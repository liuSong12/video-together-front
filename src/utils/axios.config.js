// axios config
import { showNotify } from 'vant';
import axios from 'axios';

//监听网络错误
axios.defaults.timeout = 5000;

//错误响应码
let errResponseCode = ["ERR_NETWORK", "ECONNABORTED"];

//网速信息
// console.log(navigator.connection)
//离线在线监测
//console.log(navigator.onLine)//true在线，false离线

window.addEventListener("online", () => {
    //网络监测
    const { downlink, rtt } = navigator.connection //下载速度MB/s， 延迟ms
    showNotify({
        message: `网络恢复：网速：${downlink}Mb/s,延迟：${rtt}ms`,
        type: 'success',
    })
})

window.addEventListener("offline", () => {
    //网络监测
    const { downlink, rtt } = navigator.connection //下载速度MB/s， 延迟ms
    showNotify({
        message: `网络断开：网速：${downlink}Mb/s,延迟：${rtt}ms`,
        type: 'danger',
    })
})

navigator.connection.addEventListener("change", () => {
    const { effectiveType,downlink, rtt, } = navigator.connection //下载速度MB/s， 延迟ms
    if(downlink<0.4){
        showNotify({
            message: `网速低：网络：${effectiveType},网速：${downlink}Mb/s,延迟：${rtt}ms`,
            type: 'warning'
        })
    }
})



axios.interceptors.request.use(function (config) {
    // Do something before request is sent
    const token = localStorage.getItem("token")
    if(token){
        config.headers["Authorization"] = token
    }
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    const res = response.data //后端返回的
    const token = response.headers.authorization
    token && localStorage.setItem("token",token)
    if (res?.code === 2) {
        showNotify({
            message: '出错了:' + response.data.msg,
            type: 'danger',
        })
    }
    return response;
}, function (error) {
    const status = error?.response?.status 
    if (status && status===401) {
        localStorage.removeItem("token")
        window.location.href = "#/login"
    }
    if (errResponseCode.includes(error.code)) {
        showNotify({
            message: error.message,
            type: 'danger',
        })
    }
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
});

