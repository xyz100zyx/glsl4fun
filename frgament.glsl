#verson 300 es

precision mediump float;

uniform float iGlobalTime;
uniform vec2 iResolution;

out vec4 fragColor;

#define vector_multiplying(v1, v2) cross(v1, v2)
#define VECTOR_PERPENDICULAR_TO_F_IN_CEVRTICAL_DIRECTION vec3(0.0, 1.0, 0.0)

float getLineDistance(vec3 ro, vec3 rd, vec3 point){
    return length(vector_multiplying(point-ro, rd)) / length(rd);
}

float getPointColor(vec3 ro, vec3 rd, vec3 point){
    float d = getLineDistance(ro, rd, point);
    d = smoothstep(.06, .05, d);
    return d;
}


void main(){

    vec2 uv = gl_FragCoord.xy / iResolution.xy;

    uv -= 0.5;

    uv.x *= iResolution.x / iResolution.y;

    vec3 rayOrigin = vec3(3.*sin(iGlobalTime), 2., -3.*cos(iGlobalTime));
    vec3 lookAt = vec3(0.5);

    float zoom = 1.0;

    vec3 VECTOR_F     = normalize(lookAt - rayOrigin);
    vec3 VECTOR_RIGHT = vector_multiplying(VECTOR_PERPENDICULAR_TO_F_IN_CEVRTICAL_DIRECTION, VECTOR_F);
    vec3 VECTOR_UP    = vector_multiplying(VECTOR_F, VECTOR_RIGHT);

    vec3 VECTOR_C     = rayOrigin + VECTOR_F * zoom;
    vec3 i            = VECTOR_C + uv.x * VECTOR_RIGHT + uv.y * VECTOR_UP;
    vec3 rd           = i - rayOrigin; 

    
    float d = 0.0;
    
    d += getPointColor(rayOrigin, rd, vec3(0., 0., 0.));
    d += getPointColor(rayOrigin, rd, vec3(0., 0., 1.));
    d += getPointColor(rayOrigin, rd, vec3(0., 1., 0.));
    d += getPointColor(rayOrigin, rd, vec3(0., 1., 1.));
    d += getPointColor(rayOrigin, rd, vec3(1., 0., 0.));
    d += getPointColor(rayOrigin, rd, vec3(1., 0., 1.));
    d += getPointColor(rayOrigin, rd, vec3(1., 1., 0.));
    d += getPointColor(rayOrigin, rd, vec3(1., 1., 1.));
    
    
	fragColor = vec4(d);
}