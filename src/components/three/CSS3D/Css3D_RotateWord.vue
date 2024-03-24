<script setup>
import {onMounted, onBeforeUnmount} from "vue";
import * as THREE from 'three'
import {TrackballControls} from "three/addons/controls/TrackballControls.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import TWEEN from "three/addons/libs/tween.module.js";
import {CSS2DObject,CSS2DRenderer} from "three/addons/renderers/CSS2DRenderer.js";
import circleTexture from '@/assets/img/circle.png'
import {EffectComposer} from "three/addons/postprocessing/EffectComposer.js";
import {RenderPass} from "three/addons/postprocessing/RenderPass.js";
import {OutputPass} from "three/addons/postprocessing/OutputPass.js";
import {UnrealBloomPass} from "three/addons/postprocessing/UnrealBloomPass.js";
import { SSAARenderPass } from 'three/addons/postprocessing/SSAARenderPass.js';


let scene, camera, renderer, cssRenderer
let trackballControls, orbitControls
let targetDom
let renderPass, composer, bloomPass, outputPass, ssaaPass
let mainG

function init(){
  targetDom = document.getElementById('container')
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x000000, 0.0045)
  camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
  )
  camera.position.set(0,54,241)
  camera.lookAt(0,0,0)

  renderer = new THREE.WebGLRenderer({antialias:true})
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x000000)
  document.getElementById('container').appendChild(renderer.domElement)

  cssRenderer = new CSS2DRenderer()
  cssRenderer.setSize(window.innerWidth, window.innerHeight)
  cssRenderer.domElement.style.position = 'absolute'
  cssRenderer.domElement.style.top = '0px'
  cssRenderer.domElement.style.left = '0px'
  cssRenderer.domElement.style.pointerEvents = 'none'

  document.getElementById('container').appendChild(cssRenderer.domElement)

  orbitControls = new OrbitControls(camera,renderer.domElement)
  orbitControls.enableDamping = true
  orbitControls.dampingFactor = 0.12
  orbitControls.enableZoom = false

  trackballControls = new TrackballControls(camera, renderer.domElement)
  trackballControls.noRotate = true
  trackballControls.noPan = true
  trackballControls.noZoom = false
  trackballControls.zoomSpeed = 1.5

  // const axesHelper = new THREE.AxesHelper(5)
  // scene.add(axesHelper)

  mainG = new THREE.Group()
  scene.add(mainG)

  addLight()
  createCircle()
  createChart()
  addEffect()

  renderer.setAnimationLoop(animate)
  window.addEventListener('resize',onWindowResize)
  window.onmousedown = e=>{
    console.log(camera.position)
  }
}

function addEffect(){
  renderer.colorSpace = THREE.sRGBEncoding
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1

  composer = new EffectComposer(renderer)
  renderPass = new RenderPass(scene, camera)
  bloomPass = new UnrealBloomPass(
      new THREE.Vector2(targetDom.clientWidth, targetDom.clientHeight),
      0.4, 0.5, 0.0
  )
  ssaaPass = new SSAARenderPass(scene, camera)
  outputPass = new OutputPass()
  composer.addPass(renderPass)
  composer.addPass(ssaaPass)
  composer.addPass(bloomPass)
  composer.addPass(outputPass)

  // const gui = new GUI()
  //
  // gui.add(bloomPass,'strength',0,3)
  // gui.add(bloomPass,'radius',0,3)
  // gui.add(bloomPass,'threshold',0,1)
  // gui.add(renderer,'toneMappingExposure',0,3)
}

function addLight(){
  let pLight = new THREE.PointLight(0xffffff,270,200,1)
  pLight.position.set(0,10,150)
  scene.add(pLight)
  // let pLightHelper = new THREE.PointLightHelper(pLight)
  // scene.add(pLightHelper)
}

// 绘制中心圆环
function createCircle(){

  // 中心圆环
  let midTorusGeo = new THREE.TorusGeometry(100,0.2,128,128)
  let midTorusMat = new THREE.MeshToonMaterial({color:0x01d4fe,side:THREE.DoubleSide})
  let midTorusMesh = new THREE.Mesh(midTorusGeo, midTorusMat)
  midTorusMesh.rotation.set(-Math.PI/2, 0, 0)
  mainG.add(midTorusMesh)

  // 中心圆环上的球体
  let ballGeo = new THREE.SphereGeometry(1,64,64)
  let ballMat = new THREE.MeshToonMaterial({color:0x01d4fe})
  let ballMesh = new THREE.Mesh(ballGeo,ballMat)
  let totalBall = 8
  let radius = 100
  for(let i = 0 ; i<totalBall ;i++){
    let cloneBall = ballMesh.clone()
    const theta =(Math.PI*2)/totalBall*(i+0.5)
    cloneBall.position.set(Math.cos(theta) * radius, 0, Math.sin(theta) * radius,)
    mainG.add(cloneBall)
  }

  // 中心圆环上的箭头
  let arrowPoints = [
      new THREE.Vector3(-1,1,0),
      new THREE.Vector3(0,0,0),
      new THREE.Vector3(-1,-1,0)
  ]
  const lineGeo = new THREE.BufferGeometry().setFromPoints(arrowPoints)
  const lineMat = new THREE.LineBasicMaterial({
    color:0x01d4fe,
    fog:true,
  })
  const lineMesh = new THREE.Line(lineGeo,lineMat)
  let v3 = new THREE.Vector3()

  // 中心圆环上的箭头
  let totalArrow = 8
  for(let i = 0 ; i<totalArrow ;i++){
    let cloneArrow = lineMesh.clone()
    const theta =(Math.PI*2)/totalArrow*(i)
    cloneArrow.position.set(Math.cos(theta) * radius, 0, Math.sin(theta) * radius,)
    v3.copy(cloneArrow.position).multiplyScalar(2)
    cloneArrow.lookAt(v3)
    mainG.add(cloneArrow)
  }
  const lineMat2 = new THREE.LineBasicMaterial({
    color:0x3971f3,
    fog:true,
  })

  const lineMesh2 = new THREE.Line(lineGeo,lineMat2)
  // 上圆环1上的箭头
  let totalArrow1 = 8
  let topRadius = 87
  for(let i = 0 ; i<totalArrow1 ;i++){
    let cloneArrow = lineMesh2.clone()
    const theta =(Math.PI*2)/totalArrow1*(i+0.5)
    cloneArrow.position.set(Math.cos(theta) * topRadius, 15.57, Math.sin(theta) * topRadius,)
    v3.copy(cloneArrow.position).multiplyScalar(2)
    cloneArrow.lookAt(v3)
    mainG.add(cloneArrow)
  }

  // 上圆环2
  let topTorus2Geo = new THREE.TorusGeometry(87, 0.2, 128, 128)
  let topTorus2Mat = new THREE.MeshToonMaterial({color:0x3971f3,side:THREE.DoubleSide})
  let topTorus2Mesh = new THREE.Mesh(topTorus2Geo,topTorus2Mat)
  topTorus2Mesh.rotation.set(-Math.PI/2, 0, 0)
  topTorus2Mesh.position.set(0,15.57,0)
  mainG.add(topTorus2Mesh)

  //上圆环1
  let topTorus1Geo = new THREE.TorusGeometry(60, 0.2, 128, 128)
  let topTorus1Mat = new THREE.MeshToonMaterial({color:0x3971f3,side:THREE.DoubleSide})
  let topTorus1Mesh = new THREE.Mesh(topTorus1Geo,topTorus1Mat)
  topTorus1Mesh.rotation.set(-Math.PI/2, 0, 0)
  topTorus1Mesh.position.set(0,27.38,0)
  mainG.add(topTorus1Mesh)

  // 下圆盘
  let bottomCircleGeo = new THREE.CircleGeometry(90, 128)
  let bottomCircleMat = new THREE.MeshPhysicalMaterial({
    color:0x004cff,
    clearCoat:1,
    side:THREE.DoubleSide
  })
  let bottomCircleMesh = new THREE.Mesh(bottomCircleGeo,bottomCircleMat)
  bottomCircleMesh.rotation.set(-Math.PI/2, 0, 0)
  bottomCircleMesh.position.set(0,-10.05,0)
  mainG.add(bottomCircleMesh)

  // 底圆环
  let bottomRingGeo = new THREE.RingGeometry(70, 80, 128)
  let bottomRingMat = new THREE.MeshStandardMaterial({
    color:0x004cff,
    map:new THREE.TextureLoader().load(circleTexture),
    side:THREE.DoubleSide,
    transparent:true
  })
  let bottomRingMesh = new THREE.Mesh(bottomRingGeo,bottomRingMat)
  bottomRingMesh.rotation.set(-Math.PI/2, 0, 0)
  bottomRingMesh.position.set(0,-40.51,0)
  mainG.add(bottomRingMesh)
}

// 绘制
function createChart(){
  const testEl = document.createElement('div')
  const cubeEl = document.createElement('div')
  cubeEl.className = 'cube'
  const textEl = document.createElement('div')
  textEl.innerHTML = '煤矿探放水'
  textEl.className = 'text'
  testEl.appendChild(cubeEl)
  testEl.appendChild(textEl)
  testEl.className = 'scatter-box'
  const testObj = new CSS2DObject(testEl)
  const total = 30
  let all = 0
  const rows = []
  let minY = -90 , maxY = 60
  let deltaY = maxY - minY, middleY = (maxY - minY)/2

  // let unit = deltaY / (Math.ceil(total/2))
  while(all<total){
    let num = Math.ceil(Math.random()*4)
    rows.push(num)
    all+=num
  }

  let minR = 90, maxR = 100
  let deltaR = maxR - minR, middleR = (maxR - minR)/2
  let  unit =  deltaY / (rows.length-1)

  for(let i=0;i<rows.length;i++){
    let y = maxY - Math.floor(i/2)*unit
    let radius = Math.random()*deltaR*0.1 + minR - 0.01*(
        Math.pow(y,2)-(maxY+minY)*y + maxY*minY
    )
    createFromCircle(testObj, rows[i], radius, y, i%2==0)
  }

}

function createFromCircle(obj,total,radius,y, side){
  const offset = Math.random()
  for(let i = 0 ; i<total ;i++){
    let cloneObj = obj.clone()
    if(!side){
      cloneObj.element.classList.add('delay')
    }
    const theta =(Math.PI*2)/total*(i+offset)
    cloneObj.position.set(Math.cos(theta) * radius, y, Math.sin(theta) * radius,)
    mainG.add(cloneObj)
  }
}

function onWindowResize(){
  camera.aspect = window.innerWidth/window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
  cssRenderer.setSize(window.innerWidth, window.innerHeight)
}

function animate(time){
  TWEEN.update()

  const target = orbitControls.target
  orbitControls.update()
  trackballControls.target.copy(target)
  trackballControls.update()

  mainG.rotateY(0.002)

  composer.render()
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
::v-deep(.scatter-box){
  opacity: 0;
  animation: showHide 6s infinite;

  display: flex;
  align-items: center;
  &.delay{
    animation-delay: 3s;
  }
  .cube{
    width:5px;
    height:5px;
    background-color: #fff;
    border-radius: 50%;
  }
  .text{
    margin-left:5px;
    font-size:10px;
    background: linear-gradient(90deg, #a600ff55, #0066ff55);
    padding:3px 10px;
    border-radius:10px;
    font-weight: bold;
    font-size:12px;
  }
}

@keyframes showHide {
  0%{
    opacity: 0;
  }
  50%{
    opacity: 1;
  }
  100%{
    opacity: 0;
  }
}
</style>
