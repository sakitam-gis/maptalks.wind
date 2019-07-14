<template>
  <div class="sf-map">
    <div class="sf-map-container" v-once :id="id" ref="container" ></div>
    <slot v-if="initialized"></slot>
  </div>
</template>

<script lang="ts">
  import 'maptalks/dist/maptalks.css';
  import { Map } from 'maptalks';
  import { Component, Prop, Vue, Provide } from 'vue-property-decorator';

  let i: number = 0;

  function uuid(): number {
    return i++;
  }

  @Component({
    name: 'SFMap',
    components: {},
    data() {
      return {
        initialized: false,
      };
    },
    provide() {
      const that = this;
      return {
        get map() {
          return that.$map;
        },
        set map(map) {
          that.map = map;
        }
      };
    },
    computed: {
      // ...mapState({
      //   layerConfig: (state: INavLayersState) => state.layerConfig,
      // }),
    },
  })


  export default class Button extends Vue {
    @Prop({
      type: [String, Number, Set],
      default: `map-${uuid()}`
    }) id: string | number;

    @Prop({
      default: () => [0, 0],
      type: Array,
    }) private center!: number[];

    @Prop({
      type: Number,
      default: 1
    }) private zoom!: number;

    @Prop({
      type: Number,
      default: 0,
    }) private pitch!: number;

    @Prop({
      type: Number,
      default: 0,
    }) private bearing!: number;

    @Provide()
    get map() {
      return this.$map;
    }

    private $map: any;

    private initialized: boolean;

    mounted() {
      console.log(this);
      if (this.$refs.container) {
        this.initializeMap();
      }
    }

    private initializeMap() {
      this.$map = new Map(this.$refs.container, {
        center: this.center,
        zoom: this.zoom,
        pitch: this.pitch,
        bearing: this.bearing,
      });

      this.initialized = this.$map.isLoaded();
    }

    public handleClick(...args) {
      this.$emit('click', args);
    }
  }
</script>

<style lang="less">
  .sf-map {
    height: 100vh;
    width: 100vw;
    &-container {
      width: 100%;
      height: 100%;
    }
  }

</style>
