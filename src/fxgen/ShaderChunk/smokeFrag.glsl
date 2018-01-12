// http://glslsandbox.com/e#37011.6
float rot = -1.0 * time * 0.2;
vec3 ro = vec3(0.0, -0.0, -1.0); // 4.0 * normalize(vec3(cos(rot), 0.0, sin(rot)))
vec3 ta = vec3(0.0);

// build ray
vec3 ww = normalize(ta - ro);
vec3 uu = normalize(cross(vec3(0.0, 1.0, 0.0), ww));
vec3 vv = normalize(cross(ww, uu));
vec3 rd = normalize(pin.position.x*uu + pin.position.y*vv + 0.8*ww);

// vec3 rd = normalize(vec3(pin.position, 2.0));
// circle
float circle_radius = 1.0;
float border = 0.015;
vec4 bkg_color = vec4(0.0);
vec4 circle_color = vec4(1.0);
float dist = sqrt(dot(pin.position, pin.position));
if ((dist > (circle_radius + border)) || (dist < (circle_radius - border))) {
  circle_color = bkg_color;
}

// raymarch
pout.color = raymarch(ro, rd);