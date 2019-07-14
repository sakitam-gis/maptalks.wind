<template>
  <sf-map :center="center" :zoom="zoom"></sf-map>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Provide } from 'vue-property-decorator';
  import SFMap from './components/Map.vue';

  // @ts-ignore
  import data from './data/2016112200.json';
  // @ts-ignore
  import ImageData from './data/2016112200.png';

  @Component({
    components: {
      'sf-map': SFMap,
    },
    data() {
      return {
        center: [108.93, 34.27],
        zoom: 2,
      };
    },
    computed: {
      // ...mapState({
      //   layerConfig: (state: INavLayersState) => state.layerConfig,
      // }),
    },
  })


  export default class Index extends Vue {
    mounted() {
      const windImage = new Image();
      windImage.src = ImageData;
      windImage.onload = () => {
        const layerData = {
          data,
          image: windImage
        };
        console.log(layerData);
      };
    }
  }
</script>

<style lang="less">
  #root {
    width: 100vw;
    height: 100vh;
  }

  .sf-map {
    width: 100%;
    height: 100%;
    &-container {
      width: 100%;
      height: 100%;
    }
  }
</style>
