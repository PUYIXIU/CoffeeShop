<script setup>

import {getCurrentInstance, defineAsyncComponent} from "vue";
const {proxy} = getCurrentInstance()

const ThreeComp = defineAsyncComponent({
  loader:()=>import(proxy.$route.query.router)
})

</script>

<template>
  <ThreeComp></ThreeComp>
</template>

<style scoped>

</style>