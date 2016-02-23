import m from 'mithril';

export default {
  view() {
    return m('a-plane', {
      height: 100,
      width: 100,
      color: '#966FD6',
      position: '0 -0.5 0',
      rotation: '-90 0 0',
    });
  }
};
