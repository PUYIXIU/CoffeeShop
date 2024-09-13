<script setup>
import * as THREE from 'three'
import {onBeforeUnmount, onMounted} from "vue";

let camera, scene, renderer
let targetDom
let group

function init(){
  targetDom = document.getElementById('container')
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.0002)
  camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.01,
      10000
  )
  camera.position.z = 1000
  camera.lookAt(0,0,0)
  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000)
  targetDom.appendChild(renderer.domElement)
  // 点光源
  const pointLight = new THREE.PointLight(0xffffff, 200000, 1000)
  pointLight.position.set(0, 0, 0)
  scene.add(pointLight)

  const geometry = new THREE.SphereGeometry(30, 32, 16)
  const material = new THREE.MeshToonMaterial({
    color:0xffcc33,
    alphaHash: true,
    transparent: true,
    opacity: 1,
    side:THREE.DoubleSide,
  })
  group = new THREE.Group()
  for(let i = 0; i< 2000; i++){
    let mesh = new THREE.Mesh(geometry, material)
    mesh.position.x = Math.random() * 2000 - 1000
    mesh.position.y = Math.random() * 2000 - 1000
    mesh.position.z = Math.random() * 2000 - 1000

    mesh.rotation.x = Math.random() * 2 * Math.PI
    mesh.rotation.y = Math.random() * 2 * Math.PI

    const scale = Math.random() * 2
    mesh.scale.x = scale
    mesh.scale.y = scale
    mesh.scale.z = scale
    mesh.matrixAutoUpdate = false
    mesh.updateMatrix()
    group.add(mesh)
  }
  scene.add(group)

  window.addEventListener('resize',resize)
  animation()
  render()
}

function resize(){
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animation(){
  requestAnimationFrame(animation)
  render()
}
function render() {
  group.rotation.x += 0.0005
  group.rotation.y += 0.002
  renderer.render(scene, camera)
}

onBeforeUnmount(()=>{
  window.removeEventListener('resize', resize)
})

onMounted(()=>{
  init()
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
  height:100vh;
  position:relative;
}
#container{
  width:100%;
  height:100%;
}
</style>
