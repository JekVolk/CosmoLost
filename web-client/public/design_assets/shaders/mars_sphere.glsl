precision highp float;

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/** @mouse */
uniform vec2 u_mouse;

/**
 * @label Mars Texture
 */
uniform sampler2D u_mars;

const float PI = 3.14159265359;

void addMarker(vec3 nRot, vec3 pos, vec3 col, float radius, inout vec3 finalColor) {
    float d = length(nRot - pos);
    if (d < radius * 3.5) {
        float glow = exp(-d * d / (radius * radius * 3.0)) * 0.55;
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
    
    vec4 texColor = texture2D(u_mars, vec2(u, v));
    
    // Sunlight direction
    vec3 lightDir = normalize(vec3(0.55, 0.3, 0.75));
    float ndotl = dot(normal, lightDir);
    float diff = smoothstep(-0.05, 0.68, ndotl);
    float ambient = 0.08;
    float light = ambient + (1.0 - ambient) * diff;
    
    // Martian subtle reddish-amber atmospheric rim
    float rim = pow(1.0 - z, 3.2) * 0.35;
    vec3 rimColor = vec3(0.92, 0.52, 0.32);
    
    vec3 finalRgb = texColor.rgb * light + rimColor * rim;
    
    // 3D Surface Markers physically attached to rotating Martian terrain:
    addMarker(nRot, vec3(0.9260, 0.3164, 0.2061), vec3(0.06, 0.72, 0.51), 0.018, finalRgb); // Perseverance & Ingenuity (Jezero)
    addMarker(nRot, vec3(0.6742, -0.0800, -0.7342), vec3(0.06, 0.72, 0.51), 0.018, finalRgb); // Curiosity (Gale Crater)
    addMarker(nRot, vec3(0.8516, 0.4237, -0.3088), vec3(0.06, 0.72, 0.51), 0.018, finalRgb); // Zhurong Rover (Utopia)
    addMarker(nRot, vec3(-0.0962, -0.0340, 0.9948), vec3(0.96, 0.62, 0.04), 0.018, finalRgb); // Opportunity (Meridiani Planum)
    addMarker(nRot, vec3(0.0764, -0.2515, -0.9648), vec3(0.96, 0.62, 0.04), 0.018, finalRgb); // Spirit (Gusev Crater)
    addMarker(nRot, vec3(0.6973, 0.0785, -0.7125), vec3(0.96, 0.62, 0.04), 0.018, finalRgb); // InSight (Elysium Planitia)
    addMarker(nRot, vec3(-0.3012, 0.9286, -0.2168), vec3(0.96, 0.62, 0.04), 0.018, finalRgb); // Phoenix (Vastitas Borealis)
    addMarker(nRot, vec3(-0.6864, 0.3824, 0.6186), vec3(0.96, 0.62, 0.04), 0.018, finalRgb); // Viking 1 Lander (Chryse)
    addMarker(nRot, vec3(-0.4793, 0.7428, -0.4674), vec3(0.96, 0.62, 0.04), 0.018, finalRgb); // Viking 2 Lander (Utopia)
    addMarker(nRot, vec3(-0.5215, 0.3310, 0.7864), vec3(0.96, 0.62, 0.04), 0.018, finalRgb); // Mars Pathfinder / Sojourner
    addMarker(nRot, vec3(-0.0963, -0.0358, 0.9947), vec3(0.93, 0.27, 0.27), 0.016, finalRgb); // Schiaparelli EDM
    addMarker(nRot, vec3(0.5171, -0.7071, 0.4822), vec3(0.93, 0.27, 0.27), 0.016, finalRgb); // Mars 2 (USSR)
    addMarker(nRot, vec3(-0.2649, -0.7071, -0.6556), vec3(0.93, 0.27, 0.27), 0.016, finalRgb); // Mars 3 (USSR)
    addMarker(nRot, vec3(0.9798, 0.1999, -0.0074), vec3(0.93, 0.27, 0.27), 0.016, finalRgb); // Beagle 2 (UK)
    addMarker(nRot, vec3(-0.0626, -0.9703, -0.2337), vec3(0.93, 0.27, 0.27), 0.016, finalRgb); // Mars Polar Lander
    
    // Smooth anti-aliased edge
    float alpha = smoothstep(1.0, 0.992, sqrt(r2));
    
    gl_FragColor = vec4(finalRgb, alpha);
}
