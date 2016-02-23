/* global AFRAME, OIMO */

(function () {
  'use strict';
  /*
  AFRAME.registerElement.registerElement('a-physics', {
    prototype: Object.create(AFRAME.ANode.prototype, {
      // gotta call this or else aframe hangs
      attachedCallback: {
        value: function() {

          AFRAME.ANode.prototype.load.call(this);
        }
      }
    })
  });
  */

  const ImpostorComponent = {
    schema: {
      restitution: { default: 0.01 },
      type: { default: 'cube' },
      friction: { default: 0.01 },
      mass: { default: 1 }
    },
    init() {
      this.joints = [];
      const sceneEl = this.el.sceneEl;
      sceneEl.addEventListener('loaded', () => {
        if (!('oimo-world' in sceneEl.components)) {
          console.warn('oimo-world must be specified on scene for physics to work.');
        }

        this.world = sceneEl.components['oimo-world'].world;
        this.id = this.world.add(this);
      });
    },

    initBody() {
      if (!this.bodyInitialized) {
        const o3d = this.el.object3D;

        // we're going to do some assumptions here
        // The position and rotation are based off the o3d world coords
        this.bodyConfig = {
          name: this.id,
          config: [this.data.mass, this.data.friction, this.data.restitution],
          size: [],
          type: [],
          pos: [o3d.position.x, o3d.position.y, o3d.position.z],
          rot: [
            o3d.rotation.x / (OIMO.degtorad || OIMO.TO_RAD),
            o3d.rotation.y / (OIMO.degtorad || OIMO.TO_RAD),
            o3d.rotation.z / (OIMO.degtorad || OIMO.TO_RAD)
          ],
          move: this.data.mass !== 0,
          world: this.world
        };



        this.bodyInitialized = true;
      }
    },

    beforeStep() {

    },
    afterStep() {

    }
  };

  // Move this from component to element in the future
  const WorldComponent = {
    schema: {
      gravity: { type: 'vec3', default: { x: 0, y: -9.82, z: 0 } }
    },

    init() {
      this.impostorId = 0;
      this.world = new OIMO.World(1 / 60, 2, 2, true);
      this.world.clear();
      this.impostors = {};
    },

    update() {
      this.world.gravity.copy(this.data.gravity);
    },

    add(impostor) {
      this.impostorId++;
      this.impostors[this.impostorId] = impostor;
      impostor.initBody();
      return this.impostorId;
    },

    remove(impostor) {

    },

    tick() {
      Object.keys(this.impostors).forEach((key) => {
        this.impostors[key].beforeStep();
      });

      // doesn't actually use the time param
      this.world.step();

      Object.keys(this.impostors).forEach((key) => {
        this.impostors[key].afterCall();
      });

      let contact = this.world.contacts;

      // handle collisions
      while (contact !== null) {
        if (contact.touching && !contact.body1.sleeping && !contact.body2.sleeping) {
          contact = contact.next;
          continue;
        }

        const mainImpostor = this.impostors[+contact.body1.name];
        const collidingImpostor = this.impostors[+contact.body2.name];

        if (!mainImpostor || !collidingImpostor) {
          contact = contact.next;
          continue;
        }

        mainImpostor.onCollide({ body: collidingImpostor.physicsBody });
        collidingImpostor.onCollide({ body: mainImpostor.physicsBody });
        contact = contact.next;
      }
    }
  };
}());
