precision highp float;

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/** @mouse */
uniform vec2 u_mouse;

/**
 * @label Moon Texture
 */
uniform sampler2D u_moon;

const float PI = 3.14159265359;

void addMarker(vec3 nRot, vec3 pos, vec3 col, float radius, inout vec3 finalColor) {
    float d = length(nRot - pos);
    if (d < radius * 3.5) {
        float glow = exp(-d * d / (radius * radius * 3.0)) * 0.5;
        float core = smoothstep(radius, radius * 0.65, d);
        float whiteDot = smoothstep(radius * 0.42, radius * 0.18, d);
        vec3 mCol = mix(col, vec3(1.0), whiteDot);
        finalColor = mix(finalColor, mCol, core);
        finalColor += col * glow * (1.0 - core);
    }
}

void main() {
    // Centered normalized coordinates [-1.0, 1.0]
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
    
    float r2 = dot(p, p);
    if (r2 > 1.0) {
        gl_FragColor = vec4(0.0);
        return;
    }
    
    // Z coordinate on unit sphere surface
    float z = sqrt(max(0.0, 1.0 - r2));
    vec3 normal = vec3(p.x, p.y, z);
    
    // Mouse interaction: rotates ONLY when moving/dragging mouse, no auto-spin
    vec2 mousePos = u_mouse;
    if (mousePos.x <= 0.0 && mousePos.y <= 0.0) {
        mousePos = u_resolution * 0.5;
    }
    vec2 mouseNorm = (mousePos / u_resolution) * 2.0 - 1.0;
    
    // Rotation angles: Yaw (Y-axis) and Pitch (X-axis) - static without mouse
    float rotY = mouseNorm.x * PI;
    float rotX = clamp(-mouseNorm.y * 1.2, -0.9, 0.9);
    
    // Pitch rotation (around X)
    float cosX = cos(rotX);
    float sinX = sin(rotX);
    vec3 n1 = vec3(normal.x, normal.y * cosX - normal.z * sinX, normal.y * sinX + normal.z * cosX);
    
    // Yaw rotation (around Y)
    float cosY = cos(rotY);
    float sinY = sin(rotY);
    vec3 nRot = vec3(n1.x * cosY + n1.z * sinY, n1.y, -n1.x * sinY + n1.z * cosY);
    
    // Spherical texture mapping
    float u = atan(nRot.x, nRot.z) / (2.0 * PI) + 0.5;
    float v = asin(clamp(nRot.y, -1.0, 1.0)) / PI + 0.5;
    
    vec4 texColor = texture2D(u_moon, vec2(u, v));
    
    // Sunlight direction (angled from top-left front)
    vec3 lightDir = normalize(vec3(0.5, 0.35, 0.78));
    float ndotl = dot(normal, lightDir);
    float diff = smoothstep(-0.08, 0.65, ndotl);
    float ambient = 0.07;
    float light = ambient + (1.0 - ambient) * diff;
    
    // Subtle cosmic rim highlight
    float rim = pow(1.0 - z, 3.5) * 0.28;
    vec3 rimColor = vec3(0.55, 0.6, 0.95);
    
    vec3 finalRgb = texColor.rgb * light + rimColor * rim;
    
    // 3D Surface Markers physically attached to rotating Moon terrain:
    addMarker(nRot, vec3(0.3983, 0.0118, 0.9172), vec3(0.96, 0.62, 0.04), 0.018, finalRgb); // Apollo 11 Eagle & LRRR
    addMarker(nRot, vec3(-0.3970, -0.0525, 0.9163), vec3(0.06, 0.72, 0.51), 0.018, finalRgb); // Apollo 12 Intrepid & ALSEP
    addMarker(nRot, vec3(-0.2996, -0.0636, 0.9519), vec3(0.96, 0.62, 0.04), 0.018, finalRgb); // Apollo 14 Antares & MET
    addMarker(nRot, vec3(0.0569, 0.4404, 0.8960), vec3(0.96, 0.62, 0.04), 0.018, finalRgb); // Apollo 15 Falcon & LRV
    addMarker(nRot, vec3(0.2640, -0.1560, 0.9518), vec3(0.96, 0.62, 0.04), 0.018, finalRgb); // Apollo 16 Orion & LRV
    addMarker(nRot, vec3(0.4802, 0.3452, 0.8064), vec3(0.96, 0.62, 0.04), 0.018, finalRgb); // Apollo 17 Challenger & LRV
    addMarker(nRot, vec3(0.0000, 0.4863, 0.8738), vec3(0.93, 0.27, 0.27), 0.016, finalRgb); // Luna 2
    addMarker(nRot, vec3(-0.8947, 0.1233, 0.4293), vec3(0.93, 0.27, 0.27), 0.016, finalRgb); // Luna 9
    addMarker(nRot, vec3(0.8319, -0.0119, 0.5548), vec3(0.93, 0.27, 0.27), 0.016, finalRgb); // Luna 16
    addMarker(nRot, vec3(-0.4503, 0.6195, 0.6430), vec3(0.93, 0.27, 0.27), 0.016, finalRgb); // Luna 17 Lunokhod 1
    addMarker(nRot, vec3(0.4561, 0.4360, 0.7758), vec3(0.93, 0.27, 0.27), 0.016, finalRgb); // Luna 21 Lunokhod 2
    addMarker(nRot, vec3(0.8628, 0.2207, 0.4549), vec3(0.93, 0.27, 0.27), 0.016, finalRgb); // Luna 24
    addMarker(nRot, vec3(-0.6854, -0.0431, 0.7269), vec3(0.66, 0.33, 0.97), 0.016, finalRgb); // Surveyor 1
    addMarker(nRot, vec3(-0.3969, -0.0525, 0.9163), vec3(0.22, 0.74, 0.97), 0.016, finalRgb); // Surveyor 3
    addMarker(nRot, vec3(0.3935, 0.0246, 0.9190), vec3(0.22, 0.74, 0.97), 0.016, finalRgb); // Surveyor 5
    addMarker(nRot, vec3(-0.1504, -0.6542, 0.7412), vec3(0.22, 0.74, 0.97), 0.016, finalRgb); // Surveyor 7
    addMarker(nRot, vec3(-0.2398, 0.6962, 0.6767), vec3(0.06, 0.72, 0.51), 0.016, finalRgb); // Chang'e 3 Yutu
    addMarker(nRot, vec3(-0.5751, 0.6828, 0.4506), vec3(0.06, 0.72, 0.51), 0.016, finalRgb); // Chang'e 5
    addMarker(nRot, vec3(0.1885, -0.9359, 0.2976), vec3(0.06, 0.72, 0.51), 0.016, finalRgb); // Chandrayaan 3
    addMarker(nRot, vec3(0.4151, -0.2302, 0.8802), vec3(0.06, 0.72, 0.51), 0.016, finalRgb); // SLIM (JAXA)
    addMarker(nRot, vec3(-0.0690, -0.9958, 0.0606), vec3(0.66, 0.33, 0.97), 0.015, finalRgb); // LCROSS Impact
    addMarker(nRot, vec3(0.4185, 0.0461, 0.9070), vec3(0.93, 0.27, 0.27), 0.015, finalRgb); // Ranger 8
    addMarker(nRot, vec3(0.7807, 0.2451, 0.5748), vec3(0.58, 0.64, 0.72), 0.014, finalRgb); // Apollo 11 Impact
    addMarker(nRot, vec3(-0.3608, -0.0687, 0.9301), vec3(0.93, 0.27, 0.27), 0.014, finalRgb); // Apollo 12 Impact
    addMarker(nRot, vec3(-0.4668, -0.0480, 0.8831), vec3(0.58, 0.64, 0.72), 0.014, finalRgb); // Apollo 13 S-IVB
    addMarker(nRot, vec3(-0.4343, -0.1407, 0.8897), vec3(0.58, 0.64, 0.72), 0.014, finalRgb); // Apollo 14 S-IVB
    addMarker(nRot, vec3(-0.2041, -0.0715, 0.9763), vec3(0.58, 0.64, 0.72), 0.014, finalRgb); // Apollo 15 S-IVB
    addMarker(nRot, vec3(-0.5964, -0.5629, 0.5722), vec3(0.22, 0.74, 0.97), 0.015, finalRgb); // SMART-1
    addMarker(nRot, vec3(0.4089, -0.9100, 0.0692), vec3(0.97, 0.45, 0.09), 0.015, finalRgb); // Kaguya
    addMarker(nRot, vec3(0.0270, -0.9992, 0.0297), vec3(0.22, 0.74, 0.97), 0.015, finalRgb); // Lunar Prospector
    
    // Smooth anti-aliased edge
    float alpha = smoothstep(1.0, 0.992, sqrt(r2));
    
    gl_FragColor = vec4(finalRgb, alpha);
}
