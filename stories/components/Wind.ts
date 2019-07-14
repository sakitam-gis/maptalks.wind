import {
  Component, Vue, Inject, Prop,
} from 'vue-property-decorator';

import { WindLayer } from '../..';


@Component({
  name: 'MaptalksWind',
  components: {},
  data() {
    return {};
  },
})

export default class extends Vue {
  @Prop({ default: () => {}, type: Object }) data!: any;

  @Prop({
    type: Object,
    default: () => ({})
  }) options!: any;

  @Inject('map')

  private layer: any;

  private map: any;

  created() {
    console.log('wind: create');
  }

  mounted() {
    this.$nextTick(() => {
      this.initialize();
    });
  }

  render() {}

  beforeDestroy() {
    if (this.layer) {
      this.map.removeLayer(this.layer);
    }
  }

  public setOptions(options: any) {
    if (this.layer) {
      this.layer.setOptions(options);
    }
  }

  public setWindData(data: any) {
    if (this.layer) {
      this.layer.setWindData(data);
    }
  }

  private initialize() {
    if (this.map) {
      console.log(this.map);
      this.layer = WindLayer('1', null, {
        animation: true,
        renderer: 'webgl',
        spatialReference:{
          projection:'EPSG:3857'
        }
      });

      this.map.addLayer(this.layer);

      if (this.data && this.data.toString() !== '{}') {
        this.setWindData(this.data);
      }
    }
  }
}
