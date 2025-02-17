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
      console.log("err vert shader: ", gl.getShaderInfoLog(vertexShader));
    }

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.log("err fr shader: ", gl.getShaderInfoLog(fragmentShader));
    }

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.log("err pr link: ", gl.getProgramInfoLog(program));
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
