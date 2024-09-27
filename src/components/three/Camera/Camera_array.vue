<template>
  <div class="wrap">
    <div id="container"></div>
  </div>
</template>

<script setup>
import {onMounted} from "vue";
import * as THREE from 'three'

let scene, renderer, camera, mesh
let targetDom

// 相机数组
const cameras = []
// 行列数
const AMOUNT = 6

/* 初始化 */
function init(){

  // dom容器
  targetDom = document.getElementById("container")

  const ASPEC_RATIO = window.innerWidth / window.innerHeight
  const WIDTH = (window.innerWidth / AMOUNT) * window.devicePixelRatio
  const HEIGHT = (window.innerHeight / AMOUNT) * window.devicePixelRatio

  // 相机
  for(let y = 0; y<AMOUNT; y++){
    for(let x = 0; x < AMOUNT; x++){
      const subcamera = new THREE.PerspectiveCamera(
          40,
          ASPEC_RATIO,
          0.1,
          10
      )
      subcamera.viewport = new THREE.Vector4(
          Math.floor(x * WIDTH),
          Math.floor(y * HEIGHT),
          Math.ceil(WIDTH),
          Math.ceil(HEIGHT)
      )
      subcamera.position.set(
          x/AMOUNT - 0.5,
          0.5 - y/AMOUNT,
          1.5
      )
      subcamera.position.multiplyScalar(2)
      subcamera.lookAt(0, 0, 0)
      subcamera.updateMatrixWorld()
      cameras.push(subcamera)
    }
  }
  camera = new THREE.ArrayCamera(cameras)
  camera.position.z = 3

  // 场景
  scene = new THREE.Scene()

  // 渲染器
  renderer = new THREE.WebGLRenderer({antialias:true})
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setAnimationLoop(animate)
  renderer.setClearColor(0x000000)
  targetDom.appendChild(renderer.domElement);

  // 创建光源
  const light = new THREE.DirectionalLight(0xffffff, 3)
  light.position.set(0.5, 0.5, 1)
  light.castShadow = true
  light.shadow.camera.zoom = 4
  scene.add(light)

  // 创建几何创建背景板体
  const geometryBackground = new THREE.PlaneGeometry(100, 100)
  const materialBackground = new THREE.MeshPhysicalMaterial({
    color:0x000066,
  })
  const background = new THREE.Mesh(geometryBackground, materialBackground)
  background.position.set(0, 0, -1)
  background.receiveShadow = true
  scene.add(background)

  // 创建柱状体
  const cylinderGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 32)
  const cylinderMat = new THREE.MeshPhysicalMaterial({
    color:0xff0000
  })
  mesh = new THREE.Mesh(cylinderGeo, cylinderMat)
  mesh.castShadow = true
  mesh.receiveShadow = true
  scene.add(mesh)

  // animate();

  window.addEventListener('resize', resize)
}

function resize(){
  const ASPEC_RATIO = window.innerWidth / window.innerHeight
  const WIDTH = (window.innerWidth / AMOUNT) * window.devicePixelRatio
  const HEIGHT = (window.innerHeight / AMOUNT) * window.devicePixelRatio

  camera.aspect = ASPEC_RATIO
  camera.updateProjectionMatrix()
  for(let y = 0; y < AMOUNT; y++){
    for(let x = 0;x<AMOUNT;x++){
      const subcamera = camera.cameras[AMOUNT * y + x];

      subcamera.viewport.set(
          Math.floor( x * WIDTH ),
          Math.floor( y * HEIGHT ),
          Math.ceil( WIDTH ),
          Math.ceil( HEIGHT )
      );
      subcamera.aspect = ASPEC_RATIO
      subcamera.updateProjectionMatrix()

    }
  }

  renderer.setSize(window.innerWidth, window.innerHeight)
}

/* 帧动画 */
function animate(){

  mesh.rotation.x += 0.005
  mesh.rotation.z += 0.01

  renderer.render(scene, camera)
}

onMounted(()=>{
  init()
})
</script>


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
