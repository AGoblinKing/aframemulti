import m from 'mithril';
import Firebase from 'firebase';
import player from './mcomponents/player';
import map from './mcomponents/map';

m.mount(document.body, {
  controller() {
    const ctrl = {
      sync: new Firebase('https://firebuilding.firebaseio.com'),
      players: {}
    };

    ctrl.myPlayer = ctrl.sync.child('players').push({
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    });

    ctrl.sync.child('players').on('value', (dataSnap) => {
      ctrl.players = dataSnap.val();
      m.redraw();
    });

    return ctrl;
  },
  view(ctrl) {
    return m('a-scene', [
      m('a-entity', {
        camera: true,
        rotation: '-90 0 0',
        position: '0 50 0',
      }),
      m.component(player, { sync: ctrl.myPlayer }),
      m('a-entity#players', [
        Object.keys(ctrl.players).map((key) => {
          if (key === ctrl.myPlayer.key()) {
            return null;
          }
          // set the key
          ctrl.players[key].key = key;
          return m.component(player, ctrl.players[key]);
        }),
      ]),
      m.component(map),
      m('a-sky', {
        color: '#007BB8'
      })
    ]);
  }
});
