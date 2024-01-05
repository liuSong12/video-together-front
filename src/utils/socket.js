import config from "../config"
import { useRoomStore } from "../store/roomStore"
let remoteWs = config.remoteOriginWs
const roomStore = useRoomStore()
let timer;
class WebSocketSingleton {
    static getInstance() {
        if (!WebSocketSingleton.instance) {
            WebSocketSingleton.instance = new WebSocketSingleton();
            let token = localStorage.getItem("token")
            WebSocketSingleton.instance.socket = new WebSocket(`${remoteWs}/websocket?authorization=${token}`);
            WebSocketSingleton.instance.message = {}
            WebSocketSingleton.instance.socket.onmessage = function (e) {
                let data = JSON.parse(e.data)
                if (WebSocketSingleton.instance.message[data.type]) {
                    WebSocketSingleton.instance.message[data.type](data)
                }
            }
            WebSocketSingleton.getInstance().socket.onerror = function () {
                console.log("连接出错，正在重连")
                WebSocketSingleton.instance = null
                if (timer) return;
                timer = setInterval(() => {
                    WebSocketSingleton.getInstance()
                }, 3000);
                return;
            };

            // //连接成功建立的回调方法  
            WebSocketSingleton.getInstance().socket.onopen = function () {
                console.log("连接上了")
                clearInterval(timer)
                timer = null
            }

            //连接关闭的回调方法
            WebSocketSingleton.getInstance().socket.onclose = function () {
                console.log("连接关闭了")
            }
        }
        return WebSocketSingleton.instance;
    }
    closeConnection() {
        WebSocketSingleton.instance.socket?.close()
        WebSocketSingleton.instance = null
    }
    waitMessage(type, callBack) {
        WebSocketSingleton.instance.message[type] = callBack
    }
    canclelWaitMsg(type) {
        Reflect.deleteProperty(WebSocketSingleton.instance.message, type)
    }
    sendMsg({ roomId = roomStore.roomId || null, userId = null, message = null, type }) {
        if (WebSocketSingleton.instance.t) {
            return;
        }
        let token = localStorage.getItem("token")
        WebSocketSingleton.instance.t = setTimeout(() => {
            let data = JSON.stringify({
                token,
                roomId,
                userId,
                message,
                type
            })
            WebSocketSingleton.instance.socket.send(data)
            clearTimeout(WebSocketSingleton.instance.t)
            WebSocketSingleton.instance.t = null
        }, 200);
    }
}

// //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
window.onbeforeunload = function () {
    WebSocketSingleton.getInstance().socket?.close();
}

export default WebSocketSingleton;