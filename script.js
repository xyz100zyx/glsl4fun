function doAlertMessage(message) {
  alert(message);
}

(() => {
  window.addEventListener("load", () => {
    const canvas = document.querySelector("canvas");
    canvas.width = 700;
    canvas.height = 700;

    const resolution = [canvas.width, canvas.height];

    const vertShaderSrc = `#version 300 es

    in vec2 position;
 
    void main(){
      gl_Position = vec4(position, 0.0, 1.0);
      gl_PointSize = 0.1;
    }
  `;

    const fragmentShaderSrc = `#version 300 es

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
    return ray.origin + max(0.0, scalar_multiply(point-ray.origin, ray.direction));
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

  `;

    const gl = canvas.getContext("webgl2");
    if (!gl) return;

    /**
     * @type {WebGLShader}
     */
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) return;
    gl.shaderSource(vertexShader, vertShaderSrc);
    gl.shaderSource(fragmentShader, fragmentShaderSrc);

    const program = gl.createProgram();

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      doAlertMessage("err vert shader: ", gl.getShaderInfoLog(vertexShader));
    }

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      doAlertMessage("err fr shader: ", gl.getShaderInfoLog(fragmentShader));
    }

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      doAlertMessage("err pr link: ", gl.getProgramInfoLog(program));
    }

    gl.useProgram(program);

    const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
    gl.uniform2fv(iResolutionLocation, resolution);

    const iGlobalTimeLocation = gl.getUniformLocation(program, "iGlobalTime");

    const boxVertex = new Float32Array([
      -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0,
    ]);
    const boxVertexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, boxVertex, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
    const indicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    let rafId = null;
    let stop = 0;
    let counter = 0;
    const redraw = () => {
      // gl.clearColor(0.0, 0.0, 0.0, 1.0);
      // gl.clear(gl.COLOR_BUFFER_BIT);
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        stop++;
        counter += 0.01;
        gl.uniform1f(iGlobalTimeLocation, counter);
        if (stop % 4 == 0) {
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
          gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        }
        redraw();
      });
    };
    redraw();
  });
})();
