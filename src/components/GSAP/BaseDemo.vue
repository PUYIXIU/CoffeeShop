<template>
  <div class="wrap">
    <div class="header">
      <div class="links">
        <div class="link">Link 1</div>
        <div class="link">Link 2</div>
        <div class="link">Link 3</div>
      </div>
    </div>
    <div class="content">
      <div class="sidebar left"></div>
      <button class="button" @click="reverseAnimate">Reverse!</button>
      <div class="sidebar right"></div>
    </div>
    <div class="footer"></div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import gsap from 'gsap';

const num = ref(0)

let timeline

function reverseAnimate(){
  timeline.timeScale(3)
  timeline.reverse()
}

function slideIn(){
  // gsap插值计算变量
  gsap.to(num,{
    value:100,
    duration:2,
    onUpdate:()=>console.log(num.value)
  })
  timeline = gsap.timeline({defaults:{duration:1}})
  timeline.from('.header',{y:"-100%", ease:'bounce'})
      .from('.link',{opacity:0,stagger:0.2})
      .from('.right',{x:'-100vw',ease:'power2.in'},1)
      .from('.left',{x:'-100%'},'<.5')
      .to('.footer',{y:0,ease:'elastic'})
      .fromTo('.button',
      {opacity:0,scale:0,rotation:720},
      {opacity:1,scale:1,rotation:0},
      )
}

onMounted(()=>{
  slideIn()
})

</script>

<style scoped lang="scss">
.wrap{
  height:100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .header{
    height:15vh;
    background-color: lime;
    .links{
      height:100%;
      display: flex;
      justify-content: space-around;
      align-items: center;
      .link{
        color:#000;
        font-size:30px;
        font-weight: bold;
      }
    }
  }
  .content{
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    .sidebar{
      width:10vw;
      background-color: #ffc10d;
      &.left{

      }
      &.right{

      }
    }
    .button{
      align-self: center;
      padding:5px 10px;
      font-size: 30px;
      outline:none;

    }
  }
  .footer{
    height:15vh;
    background-color: #7053f2;
    transform: translateY(100%);
  }
}
</style>
