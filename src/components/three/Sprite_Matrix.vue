<script setup>
import {onMounted, onBeforeUnmount} from "vue";
import * as THREE from 'three'
import {TrackballControls} from "three/addons/controls/TrackballControls.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import TWEEN from "three/addons/libs/tween.module.js";
import {CSS3DSprite, CSS3DRenderer} from "three/addons/renderers/CSS3DRenderer.js";

let scene, camera, renderer
let trackballControls, orbitControls
let targetDom

const ITEM_SIZE = 1000
const ModeNum = 4
const LETTER = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const objects = []
const positions = []
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
  camera.position.set(300,1500,300)
  camera.lookAt(0,0,0)

  renderer = new CSS3DRenderer({antialias:true})
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

  const item = document.createElement('div')
  item.className = 'matrix-item'
  for(let i = 0;i<ITEM_SIZE;i++){
    const itemClone = item.cloneNode()
    itemClone.style.opacity = Math.random()
    itemClone.innerText = LETTER[Math.floor(Math.random()*LETTER.length)]
    const object = new CSS3DSprite(itemClone)
    object.position.x = Math.random()*4000 -2000
    object.position.y = Math.random()*4000 -2000
    object.position.z = Math.random()*4000 -2000
    scene.add(object)
    objects.push(object)
  }
  transform()
  setInterval(changeText,0)
  // cube
  const ambient = Math.floor(Math.cbrt(ITEM_SIZE))
  const margin = 130
  const offset = (ambient-1)*margin/2
  for(let i = 0;i<ITEM_SIZE;i++){
    const x = (i%ambient)*margin - offset
    const y = offset - Math.floor((i/ambient)%ambient)*margin
    const z = Math.floor(i/ambient/ambient)*margin
    positions.push(x,y,z)
  }

  // sphere
  const radius = 750
  for(let i = 0;i<ITEM_SIZE;i++){
    const phi = Math.acos(i*2/ITEM_SIZE - 1)
    const theta = Math.sqrt(Math.PI*ITEM_SIZE) * phi
    positions.push(
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi),
    )
  }

  // helix
  const helixRadius = 1500
  const helixMargin = 10
  for(let i = 0;i<ITEM_SIZE;i++){
    const theta = 0.03 * Math.PI * i
    const y = helixMargin*i - helixMargin*ITEM_SIZE/2
    const v3 = new THREE.Vector3()
    v3.setFromCylindricalCoords(helixRadius, theta, y)
    positions.push(
        v3.x,
        v3.y,
        v3.z,
    )
  }

  // wave
  const amountX = Math.floor(Math.sqrt(ITEM_SIZE))
  const amountZ = Math.ceil(Math.sqrt(ITEM_SIZE))
  const marginWave = 75
  const offsetX = (amountX-1)*marginWave/2
  const offsetZ = (amountZ-1)*marginWave/2
  for(let i = 0;i<ITEM_SIZE;i++){
    const x = (i%amountX)*marginWave - offsetX
    const z = Math.floor((i/amountX)%amountZ)*marginWave - offsetZ
    const y = (Math.sin(0.5*x)+Math.sin(0.5*z))*200
    positions.push(x,y,z)
  }
  animate()
  window.addEventListener('resize',onWindowResize)
}

function transform(){
  current = (current + 1)%ModeNum
  const offset = current * 3 * ITEM_SIZE
  const duration = 1000
  for(let i = 0,j = offset;i<ITEM_SIZE;i+=1,j+=3){
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
      .to({},duration*3)
      .onComplete(transform)
      .start()
}

function changeText(){
  for(let i = 0;i<ITEM_SIZE; i++){
    objects[i].element.innerText = LETTER[
        Math.floor(Math.random()*LETTER.length)
        ]
  }
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
.wrap{
  width:100%;
  height: 100vh;
  position:relative;
  background: #000000;
}
#container{
  width:100%;
  height:100%;
}
::v-deep(.matrix-item){
  filter:brightness(5);
  text-shadow:
      0px 0px 3px #00ff00cc,
      0px 0px 6px #00ff00,
      0px 0px 10px #00ff00,
      0px 0px 20px #00ff00;
  color: #ffffff;
  font-size:30px;
  font-weight: bold;
}
</style>