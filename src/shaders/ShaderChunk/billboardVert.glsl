void main() {
  vec3 row0 = vec3(modelMatrix[0].x, modelMatrix[1].x, modelMatrix[2].x);
  vec3 row1 = vec3(modelMatrix[0].y, modelMatrix[1].y, modelMatrix[2].y);
  vec3 row2 = vec3(modelMatrix[0].z, modelMatrix[1].z, modelMatrix[2].z);
  vec3 wscale = vec3(length(row0), length(row1), length(row2));
  vec3 wtrans = modelMatrix[3].xyz;