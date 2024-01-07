// import ChatPanel from "../components/videowatch/ChatPanel.vue"

const routes = [
    {
        path:"/videoWatch",
        name:"videoWatch",
        component: () => import('../views/VideoWatch.vue'),
        children:[
            {
                path:"/room",
                name:"room",
                component: () => import('../components/videowatch/RoomSelect.vue')
            },
            {
                path:"/chatPanel",
                name:"chatPanel",
                component: () => import('../components/videowatch/ChatPanel.vue')
            }
        ],
        //自动重定向room页面
        redirect:"/room"
    },
    {
        path:"/videoList",
        name:"videoList",
        component: () => import('../views/VideoList.vue')
    },
    {
        path:"/videochat",
        name:"videoChat",
        component: () => import('../views/VideoChat.vue')
    },
    {
        path:"/uploadvideo",
        name:"uploadvideo",
        component: () => import('../views/UploadVideo.vue')
    },
    {
        path: "/userchange",
        name: "userChange",
        component: ()=>import("../views/UserChange.vue")
    },
    {
        path: "/videochatlist",
        name: "videoChatList",
        component: ()=>import("../views/VideoChatList.vue")
    },
    {
        path: "/home",
        name: "home",
        component: ()=>import("../views/Home.vue")
    },
    {
        path:"/",
        redirect:"/home"
    }
]

export default routes;