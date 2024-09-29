<template>
  <div class="wrap">
    <div id="container"></div>
  </div>
</template>

<script setup>
import {onMounted, onBeforeUnmount} from "vue";
import * as THREE from 'three'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'
import {GUI} from 'dat.gui'

let scene, camera, renderer
let orbitControls
let targetDom
let stats, gui



/* 初始化 */
function init(){

  const sceneA = new THREE.Scene()
  sceneA.background = new THREE.Color(0x123456)

  const sceneB = new THREE.Scene()
  sceneB.background = new THREE.TextureLoader().load('/assets/img/grid.png')

  const sceneC = new THREE.Scene()
  sceneC.background = new THREE.CubeTextureLoader().setPath('/assets/img/skybox/').load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'])

  // dom容器
  targetDom = document.getElementById("container")

  // 相机
  camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
  )
  camera.position.set(10,10,10)
  camera.lookAt(0,0,0)

  // 渲染器
  renderer = new THREE.WebGLRenderer({antialias:true})
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x000000)
  renderer.setAnimationLoop(animate)
  targetDom.appendChild(renderer.domElement);

  // 坐标系辅助器
  const axesHelper = new THREE.AxesHelper(15)
  sceneA.add(axesHelper)

  // 轨道控制器（控制移动和旋转）
  orbitControls = new OrbitControls(camera, renderer.domElement)

  // 渲染监控
  stats = new Stats()
  targetDom.appendChild(stats.dom)

  scene = sceneA
  const setScene = {
    sceneA: ()=>{
      scene = sceneA
    },
    sceneB: ()=>{
      scene = sceneB
    },
    sceneC: ()=>{
      scene = sceneC
    },
  }
  // gui
  gui = new GUI()
  gui.add(setScene, 'sceneA').name('Scene A')
  gui.add(setScene, 'sceneB').name('Scene B')
  gui.add(setScene, 'sceneC').name('Scene C')

  animate();
  window.addEventListener('resize', resize)
}

function resize(){
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

/* 帧动画 */
function animate(){
  renderer.render(scene, camera)
  stats.update()
}

onMounted(()=>{
  init()
})

onBeforeUnmount(()=>{
  gui.destroy()
})
</script>


<style scoped lang="scss">
.wrap{
  width:100%;
  height:100vh;
  position:relative;
}
#container{
  width:100%;
  height:100%;
}
</style>
