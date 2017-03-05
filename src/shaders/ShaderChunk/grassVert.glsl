// transformed += grassWindDirection * grassWindPower * max(transformed.y, 0.0) * sin(grassTime);
// vWorldPosition += grassWindDirection * grassWindPower * max(vWorldPosition.y, 0.0) * sin(grassTime);
float windStrength = (uv.y * uv.y) * (sin(grassTime + color.y * PI) * 0.5 + 0.5) * color.x;
vWorldPosition += offsets;
vWorldPosition += grassWindDirection * grassWindPower * windStrength;