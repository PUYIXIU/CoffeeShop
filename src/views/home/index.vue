<script setup>
import {getCurrentInstance, ref} from "vue";

const {proxy} = getCurrentInstance()

const linkList = ref([
  {
    linkName:'Scene 场景',
    children:[
      {
        linkName:"场景切换",
        router:'../../components/three/Scene/SwitchScene.vue'
      }
    ]
  },
  {
    linkName:'CSS3D',
    children:[
      {
        linkName:'元素周期表',
        router:'../../components/three/Css3D_Periodictable.vue',
        children:[
          {
            linkName:'星际之门版',
            router:'../../components/three/Vector3_Transform.vue'
          },
          {
            linkName:'魔方版',
            router:'../../components/three/Vector3_Cuboid.vue'
          }
        ]
      },
      {
        linkName: 'Sprite-雪碧粒子',
        router:'../../components/three/Css3D_Sprite.vue',
        children:[
          {
            linkName:'Sprite-CSS元素',
            router:'../../components/three/Sprite_CSSDom.vue'
          },
          {
            linkName:'Sprite-矩阵',
            router:'../../components/three/Sprite_Matrix.vue'
          },
        ]
      },
      {
        linkName:'旋转热点图',
        router:'../../components/three/Css3D_RotateWord.vue'
      },

    ]
  },
  {
    linkName:"Camera 相机",
    children:[
      {
        linkName:"相机阵列",
        router:'../../components/three/Camera/Camera_array.vue',
        children:[
          {
            linkName:"几何变幻图形",
            router:'../../components/three/Camera/Camera_array_shape_change.vue'
          }
        ]
      }
    ]
  },
  {
    linkName:"其它",
    children:[
      {
        // https://codepen.io/YusukeNakaya/pen/xxNdPoM
        linkName:"旋转几何光影",
        router:'../../components/three/Other_WebGLBall.vue'
      }
    ]
  },
  {
    linkName:'GSAP',
    children:[
      {
        linkName:'GSAP 基础',
        router:'../../components/GSAP/BaseDemo.vue',
      }
    ]
  }
])

function jumpToCanvas(item){
  const rootPath = '/three?'
  let paramPath = ''
  Object.entries(item).forEach(([key,value])=>{
    paramPath+=`${key}=${value}&&`
  })
  proxy.$router.push(`${rootPath}${paramPath}`)
}

</script>

<template>
  <div class="wrap">
    <div v-for="item in linkList" :key="item.linkName" class="level1-box">
      <div class="level1-name">{{item.linkName}}</div>
      <div class="level1-children">
        <div
            v-for="subItem in item.children"
            :key="item.router"
            @click.stop="jumpToCanvas(subItem)"
            class="level2-box"
        >
          <div class="level2-name name">{{subItem.linkName}}</div>
          <div class="level2-children">
            <div
                v-for="subChildItem in subItem.children"
                :key="item.router"
                @click.stop="jumpToCanvas(subChildItem)"
                class="level3-box"
            >
              <div class="level3-name name">{{subChildItem.linkName}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wrap{
  padding:10px;
  margin:10px;
  border:1px solid #fff;
  .name{
    cursor: pointer;
    &:hover{
      color:#00ff00
    }
  }
}
.level1-box{
  .level1-name{
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 15px;
  }
  .level1-children{

  }
}

.level2-box{
  margin-left:15px;
  .level2-name{
    font-size:16px;
    margin-bottom: 15px;
    font-weight: bold;
  }
  .level2-children{

  }
}
.level3-box{
  margin-left:15px;
  .level3-name{
    font-size:15px;
    margin-bottom: 5px;
  }
}
</style>
