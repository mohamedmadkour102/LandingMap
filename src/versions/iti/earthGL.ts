/**
 * Hybrid realistic Earth — one fragment shader, no dependencies.
 *
 * Draws the orthographic globe pixel-exactly in the same frame as d3.geoOrthographic
 * (rotate [-lng, -lat], scale s, translate [tx, ty]), so the SVG layers on top
 * (borders, arcs, markers, pins) stay registered to the surface.
 *
 * The texture is the brand-graded Blue Marble baked by scripts/build-earth.mjs.
 * Lighting is deliberately restrained: soft diffuse sun from the upper left, a faint
 * ocean sheen, and a thin atmospheric rim — all fading out as the camera closes in,
 * so a zoomed market reads as a calm, evenly lit map.
 */

export interface EarthView {
  lat: number
  lng: number
  s: number
  tx: number
  ty: number
}

export interface EarthFrame {
  view: EarthView
  /** device pixels per viewBox unit */
  unit: number
  /** canvas padding around the viewBox, in viewBox units */
  padX: number
  padY: number
  /** 0 → 1 intro: the surface develops outwards from Cairo */
  reveal: number
  /** 1 while the whole globe is in frame → 0 once zoomed into a flat map */
  round: number
  /** 0 → 1 fade-in once the texture has arrived */
  texAlpha: number
}

export interface EarthRenderer {
  draw(f: EarthFrame): void
  setTexture(img: TexImageSource, w: number): void
  maxTexture: number
  dispose(): void
}

const VERT = `
attribute vec2 aPos;
uniform vec4 uBox;
void main() {
  gl_Position = vec4(mix(uBox.xy, uBox.zw, aPos * 0.5 + 0.5), 0.0, 1.0);
}`

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uUnit;
uniform vec2 uPad;
uniform vec3 uView;     // tx, ty, s
uniform vec2 uRot;      // lat0, lng0 (radians)
uniform float uReveal;
uniform float uRound;
uniform float uTexA;
uniform vec3 uLight;
uniform vec3 uCairo;

const float PI = 3.14159265;
const vec3 OCEAN = vec3(0.027, 0.16, 0.25);
const vec3 ATMOS = vec3(0.56, 0.77, 0.89);

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 svg = frag / uUnit - uPad;
  vec2 n = vec2(svg.x - uView.x, uView.y - svg.y) / uView.z;
  float r = length(n);
  float px = 1.0 / (uView.z * uUnit);

  // thin atmosphere just outside the limb, brighter on the sunlit side
  float side = 0.55 + 0.45 * clamp(dot(normalize(n + 1e-5), uLight.xy) * 0.5 + 0.5, 0.0, 1.0);
  float haze = exp(-max(0.0, r - 1.0) * 26.0) * 0.26 * uRound * side;

  float inside = clamp((1.0 - r) / px + 0.5, 0.0, 1.0);
  if (inside <= 0.0) {
    gl_FragColor = vec4(ATMOS * haze, haze);
    return;
  }

  float z = sqrt(max(0.0, 1.0 - r * r));
  float sp = sin(uRot.x);
  float cp = cos(uRot.x);
  float phi = asin(clamp(n.y * cp + z * sp, -1.0, 1.0));
  float dl = atan(n.x, z * cp - n.y * sp);
  float lam = uRot.y + dl;
  vec3 tex = texture2D(uTex, vec2((lam + PI) / (2.0 * PI), (PI * 0.5 - phi) / PI)).rgb;
  vec3 c = mix(OCEAN, tex, uTexA);

  // surface develops outwards from Cairo during the intro
  vec3 world = vec3(cos(phi) * cos(lam), cos(phi) * sin(lam), sin(phi));
  float fromCairo = acos(clamp(dot(world, uCairo), -1.0, 1.0)) / PI;
  float dev = clamp((uReveal * 1.35 - fromCairo) / 0.35, 0.0, 1.0);
  c = mix(OCEAN * 0.85, c, dev);

  // restrained light: soft diffuse, faint ocean sheen, atmospheric rim
  vec3 N = vec3(n, z);
  float diff = max(dot(N, uLight), 0.0);
  float lit = mix(1.0, 0.5 + 0.62 * pow(diff, 0.85), uRound);
  float ocean = smoothstep(0.04, 0.12, c.b - c.r);
  vec3 Hv = normalize(uLight + vec3(0.0, 0.0, 1.0));
  float sheen = pow(max(dot(N, Hv), 0.0), 48.0) * 0.16 * ocean * uRound;
  float fres = pow(1.0 - z, 2.6) * 0.42 * uRound;
  vec3 col = c * lit + vec3(0.85, 0.93, 1.0) * sheen;
  col = mix(col, ATMOS * (0.35 + 0.65 * diff), fres);

  // premultiplied output: colour can never exceed alpha (invalid values composite as white on some GPUs)
  float a = clamp(inside + haze * (1.0 - inside), 0.0, 1.0);
  vec3 outc = clamp(col, 0.0, 1.0) * inside + ATMOS * haze * (1.0 - inside);
  gl_FragColor = vec4(min(outc, vec3(a)), a);
}`

const RAD = Math.PI / 180

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
  return s
}

export function createEarthRenderer(canvas: HTMLCanvasElement, light: [number, number, number], cairo: [number, number]): EarthRenderer | null {
  let gl: WebGLRenderingContext | null = null
  try {
    gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false }) as WebGLRenderingContext | null
  } catch {
    gl = null
  }
  if (!gl || gl.isContextLost()) return null

  let prog: WebGLProgram
  try {
    prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('link')
  } catch {
    return null
  }
  gl.useProgram(prog)

  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const aPos = gl.getAttribLocation(prog, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const u = (name: string) => gl!.getUniformLocation(prog, name)
  const U = {
    box: u('uBox'),
    res: u('uRes'),
    unit: u('uUnit'),
    pad: u('uPad'),
    view: u('uView'),
    rot: u('uRot'),
    reveal: u('uReveal'),
    round: u('uRound'),
    texA: u('uTexA'),
    light: u('uLight'),
    cairo: u('uCairo'),
  }
  gl.uniform3f(U.light, light[0], light[1], light[2])
  const [cLat, cLng] = [cairo[0] * RAD, cairo[1] * RAD]
  gl.uniform3f(U.cairo, Math.cos(cLat) * Math.cos(cLng), Math.cos(cLat) * Math.sin(cLng), Math.sin(cLat))

  const tex = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tex)
  // 1×1 ocean until the real surface arrives
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([7, 41, 64]))
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.uniform1i(u('uTex'), 0)

  const aniso =
    gl.getExtension('EXT_texture_filter_anisotropic') ||
    gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') ||
    gl.getExtension('MOZ_EXT_texture_filter_anisotropic')

  gl.disable(gl.DEPTH_TEST)
  gl.clearColor(0, 0, 0, 0)

  const maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number
  let texW = 0

  return {
    maxTexture,
    setTexture(img, w) {
      if (!gl || w <= texW) return
      texW = w
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)
      // power-of-two source (2048 / 4096 × half) → mipmaps keep the turning globe shimmer-free
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)))
    },
    draw(f) {
      if (!gl) return
      const cw = canvas.width
      const ch = canvas.height
      gl.viewport(0, 0, cw, ch)
      gl.clear(gl.COLOR_BUFFER_BIT)
      const { view: v, unit, padX, padY } = f
      // only shade the pixels the globe (plus its haze) can touch
      const reach = v.s * 1.14
      const x0 = ((v.tx - reach + padX) * unit) / cw
      const x1 = ((v.tx + reach + padX) * unit) / cw
      const y0 = ((v.ty - reach + padY) * unit) / ch
      const y1 = ((v.ty + reach + padY) * unit) / ch
      const cx = (t: number) => Math.max(-1, Math.min(1, t * 2 - 1))
      const cy = (t: number) => Math.max(-1, Math.min(1, 1 - t * 2))
      if (x1 <= 0 || x0 >= 1 || y1 <= 0 || y0 >= 1) return
      gl.uniform4f(U.box, cx(x0), cy(y1), cx(x1), cy(y0))
      gl.uniform2f(U.res, cw, ch)
      gl.uniform1f(U.unit, unit)
      gl.uniform2f(U.pad, padX, padY)
      gl.uniform3f(U.view, v.tx, v.ty, v.s)
      gl.uniform2f(U.rot, v.lat * RAD, v.lng * RAD)
      gl.uniform1f(U.reveal, f.reveal)
      gl.uniform1f(U.round, f.round)
      gl.uniform1f(U.texA, f.texAlpha)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    },
    dispose() {
      // free this renderer's GPU objects but keep the context alive: React (StrictMode, HMR)
      // remounts onto the same <canvas>, and a lost context there can never draw again
      if (gl && !gl.isContextLost()) {
        gl.deleteTexture(tex)
        gl.deleteBuffer(buf)
        gl.deleteProgram(prog)
      }
      gl = null
    },
  }
}
