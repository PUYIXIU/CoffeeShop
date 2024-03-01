<script setup>
import {getCurrentInstance, ref} from "vue";

const {proxy} = getCurrentInstance()

const linkList = ref([
  {
    linkName:'元素周期表',
    router:'../../components/three/Css3D_Periodictable.vue'
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
    </div>
  </div>
</template>

<style scoped>

</style>