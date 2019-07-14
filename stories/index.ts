import Vue from 'vue';
import { storiesOf } from '@storybook/vue';
import { action } from '@storybook/addon-actions';
// @ts-ignore
// import Index from './index.vue';
// @ts-ignore
import Button from './components/Button.vue';
// @ts-ignore
// import data from './data/2016112200.json';
// @ts-ignore
// import ImageData from './data/2016112200.png';

// @ts-ignore
// import Map from './components/Map.vue';
// import Wind from './components/Wind';
// @ts-ignore
import windNotes from './docs/index.md';

// Vue.component('sf-map', Map);
// Vue.component('sf-wind', Wind);
// Vue.component('ex-index', Index);
Vue.component('ex-button', Button);

// const windImage = new Image();
// windImage.src = ImageData;
// windImage.onload = () => {
//   const layerData = {
//     data,
//     image: windImage
//   };
//   console.log(layerData);
//
//   storiesOf('风场', module)
//     .add('EPSG:3857', () => `<sf-map :center="[108.93, 34.27]" :zoom="2"></sf-map>`, {
//       notes: { markdown: windNotes }
//     })
// };

// storiesOf('风场', module)
//   .add('EPSG:3857', () => `<ex-index></ex-index>`, {
//     notes: { markdown: windNotes }
//   })

storiesOf('Button', module)
  .add('with text', () => '<my-button>with text</my-button>', {
    notes: { markdown: windNotes }
  })
  .add('with emoji', () => '<my-button>😀 😎 👍 💯</my-button>')
  .add('as a component', () => ({
    components: { Button },
    template: '<button :rounded="true" @click="action">rounded</button>',
    methods: {
      action: action('log1'),
    },
  }));
