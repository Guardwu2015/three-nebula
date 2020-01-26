// Primitives
const DEFAULT_MAX_PARTICLES = 10000;
const VECTOR_3_SIZE = ['x', 'y', 'z'].length;
const RGBA_SIZE = ['r', 'g', 'b', 'a'].length;
const FLOAT_BYTE_SIZE = 4;

// Byte sizes
const POSITION_BYTE_SIZE = VECTOR_3_SIZE * FLOAT_BYTE_SIZE;
const SCALE_BYTE_SIZE = FLOAT_BYTE_SIZE;
const RGBA_BYTE_SIZE = RGBA_SIZE * FLOAT_BYTE_SIZE;
const ALL_BYTE_SIZES = [POSITION_BYTE_SIZE, SCALE_BYTE_SIZE, RGBA_BYTE_SIZE];
const PARTICLE_BYTE_SIZE = ALL_BYTE_SIZES.reduce((cur, acc) => cur + acc);

// Attributes
const POSITION_ATTRIBUTE_BUFFER_SIZE = VECTOR_3_SIZE;
const SCALE_ATTRIBUTE_BUFFER_SIZE = 1;
const RGBA_ATTRIBUTE_BUFFER_SIZE = RGBA_SIZE;
const ATTRIBUTE_TO_SIZE_MAP = {
  position: POSITION_ATTRIBUTE_BUFFER_SIZE,
  scale: SCALE_ATTRIBUTE_BUFFER_SIZE,
  rgba: RGBA_ATTRIBUTE_BUFFER_SIZE,
};

/**
 * Creates and provides performant buffers for mapping particle properties to geometry vertices.
 *
 * @see https://github.com/mrdoob/three.js/blob/master/examples/webgl_buffergeometry_points_interleaved.html
 */
window.ParticleBufferGeometry = class extends THREE.BufferGeometry {
  constructor({ maxParticles = DEFAULT_MAX_PARTICLES }) {
    super();

    this.maxParticles = maxParticles;

    this.createInterleavedBuffer().setAttributes();
  }

  /**
   * Creates the interleaved buffer that will be used to write data to the GPU.
   *
   * @return {ParticleBuffer}
   */
  createInterleavedBuffer() {
    const arrayBuffer = new ArrayBuffer(this.maxParticles * PARTICLE_BYTE_SIZE);

    this.interleavedBuffer = new THREE.InterleavedBuffer(
      new Float32Array(arrayBuffer),
      PARTICLE_BYTE_SIZE
    );

    return this;
  }

  /**
   * Sets the geometry's buffer attributes.
   *
   * NOTE Each attribute needs to be set at the right index in the buffer right after the previous
   * attribute that occupies a set amount of size in the buffer.
   *
   * @return {ParticleBufferGeometry}
   */
  setAttributes() {
    Object.keys(ATTRIBUTE_TO_SIZE_MAP).reduce((offset, attribute) => {
      const size = ATTRIBUTE_TO_SIZE_MAP[attribute];

      this.setAttribute(
        attribute,
        new THREE.InterleavedBufferAttribute(
          this.interleavedBuffer,
          size,
          offset
        )
      );

      return (offset += size);
    }, 0);

    return this;
  }

  /**
   * Gets the publicly accessible interleaved buffer.
   *
   * @return {THREE.InterleavedBuffer} buffers - The interleaved buffer
   */
  get buffer() {
    return this.interleavedBuffer;
  }

  get stride() {
    return PARTICLE_BYTE_SIZE;
  }
};
