// https://www.shadertoy.com/view/XdV3DW by vamoss

if (length(pin.position) < cRadius) {
  pout.color = vec3(0.0);
} else {
  pout.color = burn(pin.position, cSize);
}