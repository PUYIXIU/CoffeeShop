<script setup>
import {onMounted, onBeforeUnmount} from "vue";
import * as THREE from 'three'
import {TrackballControls} from "three/addons/controls/TrackballControls.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import TWEEN from "three/addons/libs/tween.module.js";
import {CSS3DSprite,CSS3DObject,CSS3DRenderer} from "three/addons/renderers/CSS3DRenderer.js";

let scene, camera, renderer, cssRenderer
let trackballControls, orbitControls
let targetDom

function init(){
  targetDom = document.getElementById('container')
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0xffffff, 2)
  camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
  )
  camera.position.set(0,0,30)
  camera.lookAt(0,0,0)

  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0xcccccc)

  cssRenderer = new CSS3DRenderer()
  cssRenderer.setSize(window.innerWidth, window.innerHeight)
  document.getElementById('container').appendChild(renderer.domElement)

  orbitControls = new OrbitControls(camera,renderer.domElement)
  orbitControls.enableDamping = true
  orbitControls.dampingFactor = 0.12
  orbitControls.enableZoom = false

  trackballControls = new TrackballControls(camera, renderer.domElement)
  trackballControls.noRotate = true
  trackballControls.noPan = true
  trackballControls.noZoom = false
  trackballControls.zoomSpeed = 1.5

  createChart()
  renderer.setAnimationLoop(animate)
  window.addEventListener('resize',onWindowResize)
}

// 绘制
function createChart(){
  const testEl = document.createElement('div')
  testEl.innerHTML = '123'
  testEl.className = 'test'
  const testObj = new CSS3DObject(testEl)
  scene.add(testObj)
  testObj.position.set(0,0,0)
}

function onWindowResize(){
  camera.aspect = window.innerWidth/window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  cssRenderer.setSize(window.innerWidth, window.innerHeight)
}

function animate(){
  TWEEN.update()

  const target = orbitControls.target
  orbitControls.update()
  trackballControls.target.copy(target)
  trackballControls.update()

  renderer.render(scene, camera)
  cssRenderer.render(scene, camera)
}

onMounted(()=>{
  init()
})

onBeforeUnmount(()=>{
  targetDom.remove()
  window.removeEventListener('resize', onWindowResize)
})

</script>

<template>
  <div class="wrap">
    <div id="container"></div>
  </div>
</template>

<style scoped lang="scss">
.wrap{
  width:100%;
  height: 100vh;
  position:relative;
  background: white;
}
#container{
  width:100%;
  height:100%;
}
::v-deep(.test){
  width: 100px;
  height: 100px;
  color:red;
  background: green;
}
</style>
