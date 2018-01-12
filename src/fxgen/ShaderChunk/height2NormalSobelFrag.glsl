vec3 vPixelSize = vec3(1.0 / resolution.x, 0.0, -1.0 / resolution.x);

/*
Coordinates are laid out as follows:

    0,0 | 1,0 | 2,0
    ----+-----+----
    0,1 | 1,1 | 2,1
    ----+-----+----
    0,2 | 1,2 | 2,2
*/

// Use of the sobel filter requires the eight samples
// surrounding the current pixel:
float h00 = texture2D( tDiffuse, pin.uv + vPixelSize.zz ).r;
float h10 = texture2D( tDiffuse, pin.uv + vPixelSize.yz ).r;
float h20 = texture2D( tDiffuse, pin.uv + vPixelSize.xz ).r;

float h01 = texture2D( tDiffuse, pin.uv + vPixelSize.zy ).r;
float h21 = texture2D( tDiffuse, pin.uv + vPixelSize.xy ).r;

float h02 = texture2D( tDiffuse, pin.uv + vPixelSize.zx ).r;
float h12 = texture2D( tDiffuse, pin.uv + vPixelSize.yx ).r;
float h22 = texture2D( tDiffuse, pin.uv + vPixelSize.xx ).r;

// The Sobel X kernel is:
//
// [ 1.0  0.0  -1.0 ]
// [ 2.0  0.0  -2.0 ]
// [ 1.0  0.0  -1.0 ]

float Gx = h00 - h20 + 2.0 * h01 - 2.0 * h21 + h02 - h22;
			
// The Sobel Y kernel is:
//
// [  1.0    2.0    1.0 ]
// [  0.0    0.0    0.0 ]
// [ -1.0   -2.0   -1.0 ]

float Gy = h00 + 2.0 * h10 + h20 - h02 - 2.0 * h12 - h22;

// Generate the missing Z component - tangent
// space normals are +Z which makes things easier
// The 0.5f leading coefficient can be used to control
// how pronounced the bumps are - less than 1.0 enhances
// and greater than 1.0 smoothes.
float Gz = 0.5 * sqrt( 1.0 - Gx * Gx - Gy * Gy );

// Make sure the returned normal is of unit length
vec3 n = normalize( vec3( cHeightScale * Gx, cHeightScale * Gy, Gz ) );

// Encode
pout.color = n*0.5 + 0.5;