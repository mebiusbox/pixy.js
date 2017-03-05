projectionPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
projectionUv = projectionMapMatrix * modelMatrix * vec4(position, 1.0);