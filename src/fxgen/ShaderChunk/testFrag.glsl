vec2 p = (-resolution + 2.0*pin.coord) / resolution.y;
vec2 m = mouse.xy / resolution.xy;
vec3 ro = 4.0*normalize(vec3(sin(3.0*m.x), 0.4*m.y, cos(3.0*m.x)));
vec3 ta = vec3(0.0,-1.0,0.0);
mat3 ca = setCamera(ro, ta, 0.0);
vec3 rd = ca*normalize(vec3(p.xy,1.5));
pout.color = render(ro, rd).xyz;