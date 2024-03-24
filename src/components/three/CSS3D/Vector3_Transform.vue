<script setup>
import * as THREE from 'three'
import {TrackballControls} from "three/addons/controls/TrackballControls.js";
import TWEEN from "three/addons/libs/tween.module.js";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'
import {onMounted, onBeforeUnmount} from "vue";
import {EffectComposer} from "three/addons/postprocessing/EffectComposer.js";
import {RenderPass} from "three/addons/postprocessing/RenderPass.js";
import {FilmPass} from "three/addons/postprocessing/FilmPass.js";
import {GlitchPass} from "three/addons/postprocessing/GlitchPass.js";
import {UnrealBloomPass} from "three/addons/postprocessing/UnrealBloomPass.js";
import {ShaderPass} from "three/addons/postprocessing/ShaderPass.js";
import {OutputPass} from "three/addons/postprocessing/OutputPass.js";


let camera, scene, renderer
let controls
let loader
let targetDom
let model
let composer, renderPass, shaderPass, outputPass, finalComposer
let bloomComposer, unrealBloomPass // 光线效果
let filmComposer, glitchPass, filmPass // 电影和毛刺效果
let filmLayer, bloomLayer

const ITEM_NUMBER = 100
const FILM_LAYER = 1
const BLOOM_LAYER = 2

const objects = []
const targets = {
  sphere:[],
  helix:[],
  grid:[],
}

function init(){
  targetDom = document.getElementById('container')

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth/window.innerHeight,
      0.01,
      10000
  )
  camera.position.z = -36
  camera.lookAt(0,0,0)
  renderer = new THREE.WebGLRenderer({antialias:true})
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x000000)
  // renderer.setClearColor(0xefefef)
  targetDom.appendChild(renderer.domElement)

  controls = new TrackballControls(camera, renderer.domElement)
  controls.minDistance = 0
  controls.maxDistance = 200

  // 图层
  filmLayer = new THREE.Layers(FILM_LAYER)
  bloomLayer = new THREE.Layers(BLOOM_LAYER)

  const aLight = new THREE.AmbientLight(0xffffff,3)
  scene.add(aLight)

  loader = new GLTFLoader()
  const v3 = new THREE.Vector3()

  loader.load('./assets/models/stargate.glb',gltf=>{
    model = gltf.scene
    for(let i=0;i<ITEM_NUMBER;i++){
      const model_item = SkeletonUtils.clone(model)
      const gateFace = model_item.getObjectByName('Cylinder001_0')
      gateFace.material.emissivemap = null
      gateFace.material.emissive = 0xffc800
      gateFace.material.color = 0xffc800
      gateFace.opacity = Math.random()*0.1 + 0.01
      gateFace.transparent = true

      scene.environment = gateFace.material.emissiveMap
      let rgb_r = Math.floor(180+100*Math.random())
      let rgb_g = Math.floor(100+100*Math.random())
      let rgb_b = Math.floor(200*Math.random())
      gateFace.material = new THREE.MeshPhysicalMaterial({
        // color:0xffc800,
        color:`rgba(${rgb_r},200,${rgb_b})`,
        side:THREE.DoubleSide,
        opacity:Math.random()*0.5+0.25,
        metalness:0,
        roughness:0,
        transparent:true,
      })
      model_item.position.x = (Math.random() * 50) - 25
      model_item.position.y = (Math.random() * 50) - 25
      model_item.position.z = (Math.random() * 50) - 25
      scene.add(model_item)
      objects.push(model_item)
    }

    // 球形定位
    for(let i = 0;i<ITEM_NUMBER;i++){
      let phi = Math.acos(i*2/ITEM_NUMBER -1)
      let theta = Math.sqrt(ITEM_NUMBER*Math.PI) * phi
      const object = new THREE.Object3D()
      object.position.setFromSphericalCoords(10,phi,theta)

      v3.copy(object.position).multiplyScalar(2)
      object.lookAt(v3)
      targets.sphere.push(object)
    }

    // 螺旋定位 radius theta y
    for(let i = 0;i<ITEM_NUMBER;i++){
      let theta = Math.PI*i* 0.175
      let y = (50 - i)*0.5
      let object = new THREE.Object3D()
      object.position.setFromCylindricalCoords(40,theta,y)
      v3.x = object.position.x * 2
      v3.y = object.position.y
      v3.z = object.position.z * 2

      object.lookAt(v3)
      targets.helix.push(object)
    }

    for(let i = 0;i<ITEM_NUMBER;i++){
      let object = new THREE.Object3D()
      object.position.x = (i%5) * 10 - 20
      object.position.y = -(Math.floor(i/5)%5)*10 + 20;
      object.position.z = Math.floor(i/25)* 20;

      targets.grid.push(object)
    }
    transform(targets.sphere,2000)
  })
  addEffect()
  window.addEventListener('resize',resize)
  window.addEventListener('mousemove',mousemove)
  animation()
  render()

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


function transform(target,duration) {
  TWEEN.removeAll()
  glitchPass.enabled = true
  for (let i = 0; i < ITEM_NUMBER; i++) {
    new TWEEN.Tween(objects[i].position)
        .to({
          x: target[i].position.x,
          y: target[i].position.y,
          z: target[i].position.z,
        }, (Math.random() + 1) * duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start()
    new TWEEN.Tween(objects[i].rotation)
        .to({
          x: target[i].rotation.x,
          y: target[i].rotation.y,
          z: target[i].rotation.z,
        }, (Math.random() + 1) * duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start()
  }
  new TWEEN.Tween(this)
      .to({},duration*2)
      .start()
      .onComplete(()=>{
        glitchPass.enabled = false
      })
}

function addEffect(){
  renderer.colorSpace = THREE.sRGBEncoding
  renderer.toneMapped = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1

  renderPass = new RenderPass(scene, camera)
  outputPass = new OutputPass()

  bloomComposer = new EffectComposer(renderer)
  unrealBloomPass = new UnrealBloomPass(
      window.innerWidth/window.innerHeight,
      0.1,0.1,0.5
  )
  bloomComposer.addPass(renderPass)
  bloomComposer.addPass(unrealBloomPass)
  bloomComposer.addPass(outputPass)
  bloomComposer.renderToScreen = false

  filmComposer = new EffectComposer(renderer)
  filmPass = new FilmPass(0.5,1)
  glitchPass = new GlitchPass(1)

  filmComposer.addPass(renderPass)
  filmComposer.addPass(filmPass)
  filmComposer.addPass(glitchPass)
  filmComposer.addPass(outputPass)
  filmComposer.renderToScreen = true

  finalComposer = new EffectComposer(renderer)
  shaderPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms:{
          base_texture:{
            type:'t',
            value:null,
          },
          bloom_texture:{
            type:'t',
            value:bloomComposer.renderTarget2.texture
          },
          film_texture:{
            type:'t',
            value:filmComposer.renderTarget2.texture
          }
        },
        vertexShader:`
          varying vec2 vUv;
          void main(){
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader:`
          uniform sampler2D base_texture;
          uniform sampler2D bloom_texture;
          uniform sampler2D film_texture;
          varying vec2 vUv;
          void main(){
            vec4 base_t = vec4(0.5)*texture2D(base_texture, vUv);
            vec4 bloom_t = vec4(0.3)*texture2D(bloom_texture, vUv);
            vec4 film_t = vec4(0.5)*texture2D(film_texture, vUv);
            gl_FragColor = base_t + bloom_t + film_t;
          }
        `,
      }),'base_texture'
  )
  finalComposer.addPass(renderPass)
  finalComposer.addPass(shaderPass)
  finalComposer.addPass(outputPass)

}

const raycaster = new THREE.Raycaster()
const mousePosition = new THREE.Vector3()

function mousemove(e){
  mousePosition.x = (e.offsetX*2/window.innerWidth) - 1
  mousePosition.y = -(e.offsetX*2/window.innerWidth) + 1
  raycaster.setFromCamera(mousePosition, camera)
}

function animation(){
  requestAnimationFrame(animation)
  render()
  controls.update()
  TWEEN.update()
}

function resize(){
  camera.aspect = window.innerWidth/window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  filmComposer.setSize(window.innerWidth, window.innerHeight)
  // bloomComposer.setSize(window.innerWidth, window.innerHeight)
  // finalComposer.setSize(window.innerWidth, window.innerHeight)
}

function render(){
  // renderer.render(scene, camera)
  // bloomComposer.render()
  filmComposer.render()
  // finalComposer.render()
}

onBeforeUnmount(()=>{
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousemove',mousemove)
})

onMounted(()=>{
  init()

})

</script>

<template>
  <div class="wrap">
    <div id="container"></div>
    <div class="btn-box">
      <button id="sphere-btn">SPHERE</button>
      <button id="helix-btn">HELIX</button>
      <button id="grid-btn">GRID</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wrap{
  width:100%;
  height:100vh;
  position:relative;
}
#container{
  width: 100%;
  height:100%;
}

.btn-box{
  position:absolute;
  bottom:0;
  right:0;
  button{
    cursor:pointer;
    padding:5px;
    font-family: Calibri;
    font-weight: bold;
    background: none;
    color:#fff;
    border:1px solid #fff;
    outline:none;
    margin-right:4px;
    font-size:18px;
    &:hover{
      background: rgba(255, 255, 255);
      color:#000;
    }
  }
}
</style>