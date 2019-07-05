// tslint:disable:ter-prefer-arrow-callback
import * as maptalks from 'maptalks';
import { WindLayer } from '../../src';

function getJSON(url: string, callback: Function) {
  const xhr = new XMLHttpRequest();
  xhr.responseType = 'json';
  xhr.open('get', url, true);
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      callback(xhr.response);
    } else {
      throw new Error(xhr.statusText);
    }
  };
  xhr.send();
}

describe('indexSpec', () => {
  let map: { addLayer: (arg0: WindLayer) => void; };
  beforeEach(function () {
    const container = document.createElement('div');
    container.style.width = '1920px';
    container.style.height = '1080px';
    document.body.appendChild(container);
    map = new maptalks.Map('map', {
      center: [108.93, 34.27],
      zoom: 2,
      // center: [-74.012, 40.705],
      // zoom: 15,
      // bearing: -20,
      // pitch: 45,
      hitDetect: false,
      centerCross: true,
      baseLayer: new maptalks.TileLayer('tile', {
        // tslint:disable-next-line:max-line-length
        urlTemplate: 'https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
        // 'subdomains': ['a', 'b', 'c', 'd'],
      }),
    });
  });

  afterEach(function () {
  });

  describe('create layer', () => {
    it('init layer', (done) => {
      const layer = new WindLayer('1', null, {
        animation: true,
        renderer: 'webgl',
        spatialReference: {
          projection: 'EPSG:3857',
        },
      });

      map.addLayer(layer);

      getJSON('./data/2016112006.json', (windData: any) => {
        const windImage = new Image();
        windImage.src = './data/2016112006.png';
        windImage.onload = () => {
          layer.setWindData({
            data: windData,
            image: windImage,
          });
          setTimeout(() => {
            done();
          }, 1000);
        };

        expect(layer).toBeDefined();

        expect(layer instanceof WindLayer).toBe(true);
      });
    });
  });
});
