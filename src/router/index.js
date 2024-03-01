import {createRouter, createWebHashHistory} from "vue-router";

export const routes = [
    {
        path:'/',
        component: ()=> import('@/views/home/index')
    },
    {
        name:'three',
        path:'/three',
        component:()=> import('@/views/threeCanvas/index')
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
