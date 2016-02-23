/* global THREE */

import m from 'mithril';
import keycode from 'keycode';

function attrs(args, def = {}) {
  return args.reduce((result, cur) => {
    if (cur[1]) {
      result[cur[0]] = cur[2]();
    }
    return result;
  }, def);
}

const keys = {
  a: 0,
  w: 0,
  s: 0,
  d: 0
};

window.addEventListener('keydown', (e) => keys[keycode(e)] = 1);
window.addEventListener('keyup', (e) => keys[keycode(e)] = 0);

export default {
  controller(args) {
    args = args || {};

    let el;
    const ctrl = {
      sync: args.sync,
      key: args.key
    };

    if (ctrl.sync) {
      const translate = new THREE.Vector3();
      const speed = 1;
      setInterval(() => {
        // attempt to get el
        if (!el) {
          el = document.getElementById('player');
        }
        translate.z = keys.w * -speed + keys.s * speed;
        translate.x = keys.a * -speed + keys.d * speed;
        el.object3D.translateZ(translate.z);
        el.object3D.translateX(translate.x);

        ctrl.sync.set({
          position: el.object3D.position.toArray(),
          rotation: el.object3D.rotation.toArray()
        });
      }, 1 / 60 * 1000);
    }
    return ctrl;
  },
  view(ctrl, args = {}) {
    return m('a-entity', attrs([
      ['position', args.position, () => args.position.join(' ')],
      ['rotation', args.rotation, () => args.rotation.slice(0, 3).join(' ')],
      ['id', ctrl.sync, () => 'player']
    ], {
      key: ctrl.sync ? 'player' : ctrl.key
    }), [
      m('a-box', {
        height: 1,
        depth: 1,
        width: 1,
        color: ctrl.sync ? '#779ECB' : '#FF0000'
      })
    ]);
  }
};
