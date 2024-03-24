<script setup>
import {onMounted, onBeforeUnmount} from "vue";
import * as THREE from 'three'
import {TrackballControls} from "three/addons/controls/TrackballControls.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {CSS3DRenderer, CSS3DObject} from "three/addons/renderers/CSS3DRenderer.js";
import TWEEN from "three/addons/libs/tween.module.js";

let scene, camera, renderer
let trackballControls, orbitControls
let targetDom

function init(){
  targetDom = document.getElementById('container')
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
  )
  camera.position.set(500,350,750)
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

  const group = new THREE.Group()
  group.add(new Element('SJOz3qjfQXU',0,0,240,0));
  group.add(new Element('Y2-xZ-1HE-Q',240,0,0,Math.PI/2));
  group.add(new Element('IrydklNpcFI',0,0,-240,Math.PI));
  group.add(new Element('9ubytEsCaS0',-240,0,0,Math.PI/2));
  scene.add(group)

  // 消除block事件
  const blocker = document.getElementById('blocker')
  blocker.style.display = 'none'
  orbitControls.addEventListener('start', function(){
    blocker.style.display = ''
  })
  orbitControls.addEventListener('end',function(){
    blocker.style.display = 'none'
  })

  animate()
  window.addEventListener('resize',onWindowResize)
}

function Element( id, x, y, z, ry ){
  const div = document.createElement('div')
  div.style.width = '480px'
  div.style.height = '360px'
  div.style.backgroundColor = '#000'

  const iframe = document.createElement('iframe')
  iframe.style.width = '480px'
  iframe.style.height = '360px'
  iframe.style.border = '0px'
  iframe.src = ['https://www.youtube.com/embed/', id, '?rel=0'].join('')
  div.appendChild(iframe)

  const object = new CSS3DObject(div)
  object.position.set(x,y,z)
  object.rotation.y = ry
  return object
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
    <div id="blocker"></div>
  </div>
</template>

<style scoped lang="scss">
.wrap{
  width:100%;
  height: 100vh;
  position:relative;
}
#container{
  width:100%;
  height:100%;
}
</style>
