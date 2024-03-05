<script setup>
import {getCurrentInstance, ref} from "vue";

const {proxy} = getCurrentInstance()

const linkList = ref([
  {
    linkName:'元素周期表',
    router:'../../components/three/Css3D_Periodictable.vue',
    children:[
      {
        linkName:'星际之门版',
        router:'../../components/three/Vector3_Transform.vue'
      },
      {
        linkName:'魔方版',
        router:'../../components/three/Vector3_Cuboid.vue'
      }
    ]
  },
])

function jumpToCanvas(item){
  const rootPath = '/three?'
  let paramPath = ''
  Object.entries(item).forEach(([key,value])=>{
    paramPath+=`${key}=${value}&&`
  })
  proxy.$router.push(`${rootPath}${paramPath}`)
}

</script>

<template>
  <div class="wrap">
    <div v-for="item in linkList">
      <div @click="jumpToCanvas(item)">{{item.linkName}}</div>
      <div class="subBox">
        <li
            v-for="subItem in item.children"
            :key="item.router"
            @click="jumpToCanvas(subItem)"
        >
          {{subItem.linkName}}
        </li>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>