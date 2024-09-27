<template>
  <div class="wrap">
<!--    <div id="container" class="back"></div>-->
    <div id="container"></div>
<!--    <div id="mask">-->
<!--    </div>-->
<!--    <div class="content">-->
<!--      <h1>Array Camera</h1>-->
<!--      <p>-->
<!--        ArrayCamera can be used in order to efficiently render a scene with a predefined set of cameras. This is an important performance aspect for rendering VR scenes.-->
<!--        <br>-->
<!--        An instance of ArrayCamera always has an array of sub cameras. It's mandatory to define for each sub camera the viewport property which determines the part of the viewport that is rendered with this camera.-->
<!--      </p>-->
<!--    </div>-->
  </div>
</template>

<script setup>
import {onMounted} from "vue";
import * as THREE from 'three'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'

let scene, camera, renderer
let orbitControls
let targetDom
let mesh,lightGroup, planeGroup
const AMOUNT =  6

/* 初始化 */
function init(){

  // dom容器
  targetDom = document.getElementById("container")

  // 场景
  scene = new THREE.Scene()

  const ASPECT_RATIO = window.innerWidth / window.innerHeight
  const WIDTH = (window.innerWidth / AMOUNT) * window.devicePixelRatio
  const HEIGHT = (window.innerHeight / AMOUNT) * window.devicePixelRatio
  const MID = Math.floor(AMOUNT / 2)
  const cameras = []

  for(let y = 0; y < AMOUNT; y++){
    for(let x = 0; x < AMOUNT; x++){
      const subcamera = new THREE.PerspectiveCamera(
          40,
          ASPECT_RATIO,
          0.1,
          1000
      )
      subcamera.viewport = new THREE.Vector4(
          Math.floor(WIDTH * x),
          Math.floor(HEIGHT * y),
          Math.ceil(WIDTH),
          Math.ceil(HEIGHT),
      )
      subcamera.position.set(2,2,2)
      subcamera.lookAt(0,0,0)
      subcamera.updateMatrixWorld()
      cameras.push(subcamera)
    }
    camera = new THREE.ArrayCamera(cameras)
    camera.position.z = 3
  }

  // // 相机
  // camera = new THREE.PerspectiveCamera(
  //     40,
  //     window.innerWidth / window.innerHeight,
  //     0.1,
  //     10000
  // )
  // camera.position.set(2,2,2)
  // camera.lookAt(0,0,0)

  // 渲染器
  renderer = new THREE.WebGLRenderer({antialias:true})
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setAnimationLoop(animate)
  renderer.setClearColor(0xffffff)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  targetDom.appendChild(renderer.domElement);

  // 坐标系辅助器
  // const axesHelper = new THREE.AxesHelper(15)
  // scene.add(axesHelper)

  // 轨道控制器（控制移动和旋转）
  orbitControls = new OrbitControls(camera, renderer.domElement)

  lightGroup = new THREE.Group()
  // const ambientLight = new THREE.AmbientLight(0xffffff,0.1)
  // scene.add(ambientLight)
  const pointLight = new THREE.PointLight(0xffffff,1,20)
  pointLight.position.set(2,0.65,0.8)
  pointLight.castShadow = true
  const pointLight2 = new THREE.PointLight(0xffffff,6,20)
  pointLight2.position.set(0.8,0.65,2)
  pointLight2.castShadow = true
  const pointLight3 = new THREE.PointLight(0xffffff,3,20)
  pointLight3.position.set(0.6,2,0.6)
  pointLight3.castShadow = true

  lightGroup.add(pointLight)
  lightGroup.add(pointLight2)
  lightGroup.add(pointLight3)

  scene.add(lightGroup)

  const size = 1
  planeGroup = new THREE.Group()
  const planeGeo = new THREE.PlaneGeometry(size,size)
  const planeMat = new THREE.MeshPhysicalMaterial({
    color:0xffffff,
    reflectivity:0.5,
    roughtness: 0.5,
  })
  const plane1 = new THREE.Mesh(planeGeo, planeMat)
  const plane2 = new THREE.Mesh(planeGeo, planeMat)
  const plane3 = new THREE.Mesh(planeGeo, planeMat)
  plane1.receiveShadow = true
  plane2.receiveShadow = true
  plane3.receiveShadow = true
  plane2.rotation.y =  Math.PI / 2
  plane3.rotation.x = - Math.PI / 2
  plane1.position.x = size/2
  plane1.position.y = size/2
  plane2.position.z = size/2
  plane2.position.y = size/2
  plane3.position.z = size/2
  plane3.position.x = size/2

  planeGroup.add(plane1)
  planeGroup.add(plane2)
  planeGroup.add(plane3)

  scene.add(planeGroup)

  const boxGeo = new THREE.BoxGeometry(0.2,0.2,0.2)
  const boxMat = planeMat
  mesh = new THREE.Mesh(boxGeo, boxMat)
  mesh.castShadow = true
  scene.add(mesh)
  mesh.position.set(0.6, 0.55,0.6)

  window.addEventListener('resize', resize)
}

function resize(){

  const ASPECT_RATIO = window.innerWidth / window.innerHeight
  const WIDTH = (window.innerWidth / AMOUNT) * window.devicePixelRatio
  const HEIGHT = (window.innerHeight / AMOUNT) * window.devicePixelRatio
  const MID = Math.floor(AMOUNT / 2)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  for(let y = 0; y < AMOUNT; y++){
    for(let x = 0; x < AMOUNT; x++){
      let subcamera = camera.cameras[AMOUNT * y + x]
      subcamera.viewport = new THREE.Vector4(
          Math.floor(WIDTH * x),
          Math.floor(HEIGHT * y),
          Math.ceil(WIDTH),
          Math.ceil(HEIGHT),
      )
      subcamera.aspect = ASPECT_RATIO
      subcamera.updateProjectionMatrix()
    }
  }
  renderer.setSize(window.innerWidth, window.innerHeight)
}
/* 帧动画 */
function animate(e){
  mesh.rotation.x += 0.01
  mesh.rotation.z += 0.01
  // lightGroup.rotation.x += 0.01
  planeGroup.rotation.x -= 0.01
  planeGroup.rotation.z -= 0.01
  renderer.render(scene, camera)
}

onMounted(()=>{
  init()
})
</script>


<style scoped lang="scss">
@import url('https://fonts.cdnfonts.com/css/abril-fatface');
.wrap{
  width:100%;
  height:100vh;
  position:relative;
}
#container{
  width:100%;
  height:100%;
}
.back{
  opacity: 0.7;
  filter:sepia(0.5) hue-rotate(0deg) blur(5px);
  animation:hueColor 10s infinite linear;
}
#mask{
  position:absolute;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background: #fff;
  opacity: 0.3;
  display: grid;
  place-items: center;

}
@keyframes hueColor{
  0%{
    filter:sepia(0.5) hue-rotate(0deg) blur(5px);;
  }
  100%{
    filter:sepia(0.5) hue-rotate(360deg) blur(5px);;
  }
}
.content{
  position:absolute;
  max-width:400px;
  top:50%;
  left:50%;
  transform:translate(-50%,-50%);
  background: rgba(255, 255, 255, 0.6);
  box-shadow:
    0px 0px 5px rgba(199, 0, 255, 0.1),
    5px 5px 10px rgba(68, 130, 0, 0.04),
    5px 5px 20px rgba(136, 255, 0, 0.02),
    5px 5px 40px rgba(136, 255, 0, 0.01),
    -5px -5px 10px rgba(2, 22, 145, 0.04),
    -5px -5px 20px rgba(0, 34, 255, 0.02),
    -5px -5px 40px rgba(0, 34, 255, 0.01);
;
  padding:3rem 2rem;
  border-radius: 1rem;
  h1{
    background:
        linear-gradient(90deg, #8576dd 0%, #76c652 100%);
    color:transparent;
    text-shadow: 0px 0px 20px #ffffff;
    background-clip: text;
    font-size: 2rem;
    font-family: 'Abril Fatface', sans-serif;
    text-align: center;
    padding-bottom:2rem;
    border-bottom:1px solid #bdb0c0;
  }
  p{
    margin-top:2rem;
    color: #b2a6bc;
    font-family: 'Abril Fatface', sans-serif;
    line-height:2rem;
  }
}
</style>
