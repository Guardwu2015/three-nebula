import { EULER, POOL_MAX } from '../constants';

import Integration from '../math/Integration';
import Pool from './Pool';
import { initValue } from '../utils/Util';

export default class Proton {
  /**
   * @name Proton is a particle engine for three.js
   *
   * @class Proton
   * @param {number} preParticles input any number
   * @param {number} integrationType input any number
   * @example var proton = new Proton(200);
   */
  constructor(preParticles, integrationType) {
    this.preParticles = initValue(preParticles, POOL_MAX);
    this.integrationType = initValue(integrationType, EULER);
    this.emitters = [];
    this.renderers = [];
    this.pool = new Pool();
  }

  static get integrator() {
    return new Integration(this.integrationType);
  }

  /**
   * @name add a type of Renderer
   *
   * @method addRender
   * @param {Renderer} render
   */
  addRender(renderer) {
    this.renderers.push(renderer);
    renderer.init(this);
  }

  /**
   * @name add a type of Renderer
   *
   * @method addRender
   * @param {Renderer} render
   */
  removeRender(renderer) {
    this.renderers.splice(this.renderers.indexOf(renderer), 1);
    renderer.remove(this);
  }

  /**
   * add the Emitter
   *
   * @method addEmitter
   * @param {Emitter} emitter
   */
  addEmitter(emitter) {
    this.emitters.push(emitter);
    emitter.parent = this;
    this.dispatchEvent('EMITTER_ADDED', emitter);
  }

  removeEmitter(emitter) {
    if (emitter.parent != this) return;

    this.emitters.splice(this.emitters.indexOf(emitter), 1);
    emitter.parent = null;
    this.dispatchEvent('EMITTER_REMOVED', emitter);
  }

  update($delta) {
    this.dispatchEvent('PROTON_UPDATE', this);

    var delta = $delta || 0.0167;

    if (delta > 0) {
      var i = this.emitters.length;

      while (i--) this.emitters[i].update(delta);
    }

    this.dispatchEvent('PROTON_UPDATE_AFTER', this);
  }

  /**
   * getCount
   * @name get the count of particle
   * @return (number) particles count
   */
  getCount() {
    var total = 0;
    var i,
      length = this.emitters.length;

    for (i = 0; i < length; i++) total += this.emitters[i].particles.length;

    return total;
  }

  /**
   * destroy
   * @name destroy the proton
   */
  destroy() {
    var i = 0,
      length = this.emitters.length;

    for (i; i < length; i++) {
      this.emitters[i].destroy();
      delete this.emitters[i];
    }

    this.emitters.length = 0;
    this.pool.destroy();
  }
}

export const integrator = Proton.integrator();
