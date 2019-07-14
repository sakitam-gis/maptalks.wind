<template>
  <button class="button">
    {{text}}
    <slot></slot>
  </button>
</template>

<script lang="ts">
  import { Component, Prop, Vue, Provide } from 'vue-property-decorator';

  @Component({
    name: 'Button',
    components: {},
    data() {
      return {};
    },
    computed: {
      // ...mapState({
      //   layerConfig: (state: INavLayersState) => state.layerConfig,
      // }),
    },
  })


  export default class Index extends Vue {
    @Prop({
      type: [String, Number],
      default: '321',
    }) text!: string | number;

    mounted() {
      console.log('111');
    }
  }
</script>

<style lang="less">
  .button {
    color: #0074D9;
  }
</style>
