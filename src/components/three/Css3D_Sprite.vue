<script setup>
import {onMounted, onBeforeUnmount} from "vue";
import * as THREE from 'three'
import {TrackballControls} from "three/addons/controls/TrackballControls.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import TWEEN from "three/addons/libs/tween.module.js";
import {CSS3DRenderer, CSS3DSprite} from "three/addons/renderers/CSS3DRenderer.js";

let scene, camera, renderer
let trackballControls, orbitControls
let targetDom

const particlesTotal = 512;
const positions = []
const objects = []
let current = 0

function init(){
  targetDom = document.getElementById('container')
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      5000
  )
  camera.position.set(600,400,1500)
  camera.lookAt(0,0,0)

  renderer = new CSS3DRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
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

  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  const gridHelper = new THREE.GridHelper(12,12)
  scene.add(gridHelper)

  const image = document.createElement('img')
  image.addEventListener('load', function(){
    // 初始化坐标
    for(let i = 0; i < particlesTotal; i++){
      const object = new CSS3DSprite(image.cloneNode())
      object.position.x = Math.random() * 4000 - 2000
      object.position.y = Math.random() * 4000 - 2000
      object.position.z = Math.random() * 4000 - 2000
      scene.add(object)
      objects.push(object)
    }
    transition()
  })
  image.src = './assets/img/sprite.png'

  // 波浪面
  const amountX = 16 // x轴一行分布个数
  const amountZ = 32  // z轴一列分布个数
  const separationPlane = 150 // 间隔
  const offsetX = (amountX - 1)*separationPlane/2
  const offsetZ = (amountZ - 1)*separationPlane/2
  for(let i = 0;i<particlesTotal;i++){
    const x = (i % amountX) * separationPlane-offsetX
    const z = Math.floor((i/amountX)%amountZ) * separationPlane- offsetZ
    const y = (Math.sin(0.5*x) + Math.sin(0.5*z)) * 200
    positions.push(x, y, z )
  }

  // 方块
  const amount = 8
  const separationCube = 150
  const offset = (amount - 1)*separationCube/2
  for(let i = 0;i<particlesTotal;i++){
    const x = (i%amount)*separationCube - offset
    const y = offset - Math.floor((i/amount)%amount)*separationCube
    const z = Math.floor(i/amount/amount)*separationCube - offset
    positions.push(x,y,z)
  }

  // 随机
  for(let i = 0; i < particlesTotal; i++){
    const x = Math.random() * 4000 - 2000
    const y = Math.random() * 4000 - 2000
    const z = Math.random() * 4000 - 2000
    positions.push(x,y,z)
  }

  // 球形
  const radius = 750
  for(let i = 0;i<particlesTotal;i++){
    const phi = Math.acos(-1 + i*2/particlesTotal)
    const theta = Math.sqrt(particlesTotal * Math.PI) * phi
    positions.push(
        Math.cos(theta) * Math.sin(phi) * radius,
        Math.sin(theta) * Math.sin(phi) * radius,
        Math.cos(phi) * radius,
    )
  }
  animate()
  window.addEventListener('resize',onWindowResize)
  new THREE.Vector3().setFromSphericalCoords()
}

function transition(){
  const offset = current * particlesTotal * 3
  const duration = 2000;
  for(let i = 0, j = offset; i < particlesTotal;i++,j+=3){
    const object = objects[i]
    new TWEEN.Tween(object.position)
        .to({
          x:positions[j],
          y:positions[j+1],
          z:positions[j+2],
        },Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start()
  }
  new TWEEN.Tween(this)
      .to({},duration*3)
      .onComplete(transition)
      .start()
  current = (current + 1)%4
}

function onWindowResize(){
  camera.aspect = window.innerWidth/window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate(){
  requestAnimationFrame(animate)
  TWEEN.update()

  const target = orbitControls.target
  orbitControls.update()
  trackballControls.target.copy(target)
  trackballControls.update()

  const time = performance.now()
  for(let i = 0, l = objects.length; i < l; i++){
    const object = objects[i]
    const scale = Math.sin(Math.floor(object.position.x) + time) * 0.002 * 0.3 + 1
    object.scale.set(scale, scale, scale)
  }

  renderer.render(scene, camera)
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
  background: #f2fdff;
  width:100%;
  height: 100vh;
  position:relative;
}
#container{
  width:100%;
  height:100%;
}
</style>