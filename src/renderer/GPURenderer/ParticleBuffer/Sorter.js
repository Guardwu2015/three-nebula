/*eslint no-prototype-builtins: 0*/

import { Vector3 } from '../../../core/three';

export default class Sorter {
  constructor(frameSkip) {
    this.frameSkip = frameSkip || 0;
  }

  sort(attributes, cameraPosition, { buffer, stride }) {
    const distances = [];
    const tempPosition = new Vector3();
    const { offset, count } = attributes.position;
    let currentFrame = 0;

    console.log(offset);

    if (currentFrame > 0) {
      if (currentFrame > this.frameSkip) {
        // Render next frame
        currentFrame = 0;
      } else {
        currentFrame += 1;
      }

      return;
    }

    currentFrame += 1;

    for (let i = 0; i < count; ++i) {
      tempPosition.set(
        buffer.array[i * stride + offset + 0],
        buffer.array[i * stride + offset + 1],
        buffer.array[i * stride + offset + 2]
      );

      distances[i] = [cameraPosition.distanceTo(tempPosition), i];
    }

    distances.sort(function(a, b) {
      return b[0] - a[0];
    });

    for (const val in attributes) {
      if (!attributes.hasOwnProperty(val)) {
        continue;
      }

      var itemSize = attributes[val].itemSize;
      var newArray = new Float32Array(itemSize * count);

      for (let i = 0; i < count; ++i) {
        const index = distances[i][1];

        for (var j = 0; j < itemSize; ++j) {
          const srcIndex = index * itemSize + j;
          const dstIndex = i * itemSize + j;

          newArray[dstIndex] = attributes[val].array[srcIndex];
        }
      }

      attributes[val].array = newArray;
      attributes[val].needsUpdate = true;
    }
  }
}
