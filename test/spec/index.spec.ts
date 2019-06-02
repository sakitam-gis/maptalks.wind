// @ts-ignore
import * as maptalks from 'maptalks';

describe('indexSpec', () => {
  beforeEach(function () {
  });

  afterEach(function () {
  });

  describe('create layer', () => {
    it('creat dom content', () => {
      const layer = new maptalks.WindLayer('1', null, {
        animation: true,
        renderer: 'webgl',
        spatialReference:{
          projection:'EPSG:4326'
        }
      });
      expect(layer instanceof maptalks.WindLayer).to.be.ok();
    });
  });
});
