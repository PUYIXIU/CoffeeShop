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

const ModeNum = 4
const particlesTotal = 512;
const positions = []
const objects = []
let current = 0

function init(){
  targetDom = document.getElementById('container')
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
  )
  camera.position.set(300,1500,0)
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

  const wrap = document.createElement('div')
  wrap.className = 'item-wrap'

  // 初始化
  for(let i = 0;i<particlesTotal;i++){
    const wrapClone = wrap.cloneNode()
    wrapClone.style.opacity = Math.random()
    const object = new CSS3DSprite(wrapClone)
    object.position.x = Math.random()*4000 - 2000;
    object.position.y = Math.random()*4000 - 2000;
    object.position.z = Math.random()*4000 - 2000;
    scene.add(object)
    objects.push(object)
  }

  transform()

  // 波浪形
  const ambientX = 16
  const ambientZ = 32
  const margin = 150
  const offsetX = (ambientX - 1)*margin/2
  const offsetZ = (ambientZ - 1)*margin/2
  for(let i = 0;i<particlesTotal;i++){
    const x = (i%ambientX)*margin -offsetX
    const z = Math.floor((i/ambientX)%ambientZ)*margin - offsetZ
    const y = (Math.sin(0.5 * x) + Math.sin(0.5 * z))* 200
    positions.push(x,y,z)
  }

  // 立方体
  const ambient = 8
  const matrixMargin = 150
  const cubeMatrix = (ambient-1)*matrixMargin/2
  for(let i = 0;i<particlesTotal;i++){
    const x = (i%ambient)*matrixMargin - cubeMatrix/2
    const y = cubeMatrix/2 - Math.floor((i/ambient)%ambient)*matrixMargin
    const z = Math.floor(i/ambient/ambient)*matrixMargin
    positions.push(x,y,z)
  }

  // 球形
  const radius = 750
  for(let i = 0;i<particlesTotal;i++){
    const phi = Math.acos(i*2/particlesTotal - 1)
    const theta = Math.sqrt(particlesTotal*Math.PI)*phi
    positions.push(
        radius*Math.cos(theta)*Math.sin(phi),
        radius*Math.sin(theta)*Math.sin(phi),
        radius*Math.cos(phi),
    )
  }

  // 螺旋形
  const zMargin = 50
  for(let i =0;i<particlesTotal;i++){
    const theta = Math.PI*i*0.05
    const y = zMargin * i - zMargin*(particlesTotal-1)/2
    const v3 = new THREE.Vector3()
    v3.setFromCylindricalCoords(1500,theta,y)
    positions.push(
        v3.x,
        v3.y,
        v3.z
    )
  }

  animate()
  window.addEventListener('resize',onWindowResize)
}

function transform(){
  current = (current+1)%ModeNum
  const offset = current * particlesTotal * 3
  const duration = 1000
  for(let i = 0, j = offset; i<particlesTotal;i++,j+=3){
    const object = objects[i]
    new TWEEN.Tween(object.position)
        .to({
          x:positions[j],
          y:positions[j+1],
          z:positions[j+2],
        },(1+Math.random())*duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start()
  }
  new TWEEN.Tween(this)
      .to({},duration*2)
      .onComplete(transform)
      .start()
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
$item_bg: transparent;
$item_color_lt: #00ffce;
$item_color_rt: #4ffde6;
$item_color_lb: #b9fafc;
$item_color_rb: #d3fffb;
$item_width: 40px;
.wrap{
  width:100%;
  height: 100vh;
  position:relative;
}
#container{
  width:100%;
  height:100%;
}
::v-deep(.item-wrap){
  width: 100px;
  height:100px;
  background: $item_bg;
  position:relative;
  animation: hueRotate 3s infinite;

  &:before{
    content:'';
    position:absolute;
    top:0;
    left:0;
    height:$item_width;
    width:100px;
    background: linear-gradient(
            90deg,
            $item_color_lt 0px,
            $item_color_lt $item_width,
            $item_bg $item_width,
            $item_bg calc(100px - $item_width),
            $item_color_rt calc(100px - $item_width),
            $item_color_rt 100px,
    );
  }
  &:after{
    content:'';
    position:absolute;
    bottom:0;
    left:0;
    height:$item_width;
    width:100px;
    background: linear-gradient(
            90deg,
            $item_color_lb 0px,
            $item_color_lb $item_width,
            $item_bg $item_width,
            $item_bg calc(100px - $item_width),
            $item_color_rb calc(100px - $item_width),
            $item_color_rb 100px,
    );
  }

  @keyframes hueRotate{
    from{
      filter:hue-rotate(0deg);
    }
    to{
      filter:hue-rotate(360deg);
    }
  }
}
</style>