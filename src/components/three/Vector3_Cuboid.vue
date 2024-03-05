<script setup>
import {onBeforeUnmount, onMounted} from "vue";
import * as THREE from 'three'
import TWEEN from "three/addons/libs/tween.module.js";
import {TrackballControls} from "three/addons/controls/TrackballControls.js";
import {EffectComposer} from "three/addons/postprocessing/EffectComposer.js";
import {RenderPass} from "three/addons/postprocessing/RenderPass.js";
import {OutputPass} from "three/addons/postprocessing/OutputPass.js";
import {FilmPass} from "three/addons/postprocessing/FilmPass.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {RGBELoader} from "three/addons/loaders/RGBELoader.js";
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'

let renderer, scene, camera, controls
let filmComposer, filmPass
let renderPass, outputPass
let loader, model
const SIZE = 250
const objects = []
const targets = {
  table:[],
  sphere:[],
  helix:[],
  grid:[],
}

function init(){

  renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth,window.innerHeight)
  renderer.setClearColor(0x000000)

  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 4.8

  document.getElementById('container').appendChild(renderer.domElement)

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth/window.innerHeight,
      1,
      1000
  )
  camera.position.set(0,0,-75)
  controls = new TrackballControls(camera, renderer.domElement)

  const rgbeLoader = new RGBELoader()
  loader = new GLTFLoader()

  rgbeLoader.load('./assets/hdr/kitchen.hdr',texture=>{
    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.environment = texture
    loader.load('./assets/models/cuboid.glb',gltf=>{
      model = gltf.scene
      model.scale.set(0.1,0.1,0.1)
      // scene.add(model)
      getPosition()
      transform(targets.sphere,2000)
    })
  })
  addEffect()
  renderer.setAnimationLoop(animate)
  window.addEventListener('resize', resize)
}

function getPosition(){
  // init
  for(let i = 0;i<SIZE;i++){
    const modelClone = SkeletonUtils.clone(model)
    modelClone.position.x = Math.random()*140 - 70
    modelClone.position.y = Math.random()*140 - 70
    modelClone.position.z = Math.random()*140 - 70
    modelClone.rotation.x = Math.random()*Math.PI*2
    modelClone.rotation.y = Math.random()*Math.PI*2
    modelClone.rotation.z = Math.random()*Math.PI*2
    scene.add(modelClone)
    objects.push(modelClone)
  }
  let v3 = new THREE.Vector3()
  // sphere
  for(let i = 0;i<SIZE;i++){
    const phi = Math.acos(i*2/SIZE - 1)
    const theta = Math.sqrt(Math.PI * SIZE)*phi
    const object = new THREE.Object3D()
    object.position.setFromSphericalCoords(30, phi, theta)
    v3.copy(object.position).multiplyScalar(2)
    object.lookAt(v3)
    targets.sphere.push(object)
  }
  // helix
  for(let i =0;i<SIZE;i++){
    const theta = Math.PI * 0.05 * i;
    const y = ((SIZE+1)/2*0.3 - 0.3*i)
    const object = new THREE.Object3D()
    object.position.setFromCylindricalCoords(50,theta,y)
    v3.copy(object.position).multiplyScalar(2)
    object.lookAt(v3)
    targets.helix.push(object)
  }
  // grid
  for(let i = 0;i<SIZE;i++){
    const object = new THREE.Object3D()
    object.position.x = (i%5)*8 - 2.5*8
    object.position.y = 2.5*8 - Math.floor(i/5)%5*8
    object.position.z = Math.floor(i/25)*8
    targets.grid.push(object)
  }

  document.getElementById('table-btn').addEventListener('mousedown',e=>{
    transform(targets.sphere,2000)
  })
  document.getElementById('sphere-btn').addEventListener('mousedown',e=>{
    transform(targets.sphere,2000)
  })
  document.getElementById('helix-btn').addEventListener('mousedown',e=>{
    transform(targets.helix,2000)
  })
  document.getElementById('grid-btn').addEventListener('mousedown',e=>{
    transform(targets.grid,2000)
  })
}

function transform(targets, duration){
  TWEEN.removeAll()
  for(let i = 0; i<SIZE;i++){
    const obj = objects[i]
    const target = targets[i]
    new TWEEN.Tween(obj.position)
        .to({
          x:target.position.x,
          y:target.position.y,
          z:target.position.z,
        },(Math.random()+1)*duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start()
    new TWEEN.Tween(obj.rotation)
        .to({
          x:target.rotation.x,
          y:target.rotation.y,
          z:target.rotation.z,
        },(Math.random()+1)*duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start()
  }
  new TWEEN.Tween(this)
      .to({},duration*2)
      .start()
}

function addEffect(){
  filmComposer = new EffectComposer(renderer)
  renderPass = new RenderPass(scene,camera)
  outputPass = new OutputPass()
  filmPass = new FilmPass(1,1)

  filmComposer.addPass(renderPass)
  filmComposer.addPass(filmPass)
  filmComposer.addPass(outputPass)
}

function animate(){
  controls.update()
  TWEEN.update()
  // renderer.render(scene,camera)
  filmComposer.render()
}

function resize(){
  camera.aspect = window.innerWidth/window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  halftoneComposer.setSize(window.innerWidth, window.innerHeight)
}

onMounted(()=>{
  init()
})

onBeforeUnmount(()=>{
  document.getElementById('container').remove()
})
</script>

<template>
  <div class="wrapper">
    <div id="container"></div>
    <div class="btn-box">
      <button id="table-btn">TABLE</button>
      <button id="sphere-btn">SPHERE</button>
      <button id="helix-btn">HELIX</button>
      <button id="grid-btn">GRID</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wrapper{
  position:relative;
  width: 100%;
  height:100vh;
  #container{
    width: 100%;
    height:100%;
  }
  .btn-box{
    position:absolute;
    right:10px;
    bottom:10px;
    button{
      padding:3px 5px;
      background: transparent;
      color:#fff;
      border:1px solid #fff;
      outlint:none;
      font-weight: bold;
      cursor:pointer;
      &:hover{
        background: white;
        color:#000
      }
    }
  }
}
</style>