#version 300 es

precision mediump float;

uniform float iGlobalTime;
uniform vec2 iResolution;

out vec4 fragColor;

#define vector_multiply(v1, v2) cross(v1, v2)
#define scalar_multiply(v1, v2) dot(v1, v2)
#define VECTOR_PERPENDICULAR_TO_F_IN_CEVRTICAL_DIRECTION vec3(0.0, 1.0, 0.0)

struct Ray {
    vec3 origin, direction;
};

Ray createRay(vec2 uv, vec3 camera, vec3 lookAt, float zoom){
    vec3 VECTOR_F     = normalize(lookAt - camera);
    vec3 VECTOR_RIGHT = vector_multiply(VECTOR_F, VECTOR_PERPENDICULAR_TO_F_IN_CEVRTICAL_DIRECTION);
    vec3 VECTOR_UP    = vector_multiply(VECTOR_RIGHT, VECTOR_F);
    vec3 center       = camera + VECTOR_F * zoom;

    vec3 intersection = camera + uv.x * VECTOR_RIGHT + uv.y * VECTOR_UP;

    Ray ray;
    ray.origin        = camera;
    ray.direction     = normalize(intersection - camera);

    return ray;

}

vec3 getClosestPoint(Ray ray, vec3 point){
    return ray.origin + max(0.0, scalar_multiply(point-ray.origin, ray.direction)) * ray.direction;
}

float getRay2PointDistance(Ray ray, vec3 point){
    return length(point - getClosestPoint(ray, point));
}

void main(){

    vec2 uv           = gl_FragCoord.xy / iResolution.xy;
    uv               -= 0.5;
    uv.x             *= iResolution.x / iResolution.y;

    vec3 camera       = vec3(0.0, 2.0, 0.0);
    vec3 lookAt       = vec3(0.0, 2.0, 1.0);

    Ray ray           = createRay(uv, camera, lookAt, 2.0);

    vec3 point        = vec3(0.0, 0.0, 5.0);

    float distance    = getRay2PointDistance(ray, point);

    float color       = smoothstep(.1, 0.09, distance);

    fragColor         = vec4(color);

}