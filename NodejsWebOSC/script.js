
var main=function() {

  var CANVAS=document.getElementById("your_canvas");

  CANVAS.width=window.innerWidth;
  CANVAS.height=window.innerHeight;
  
var mousePosition=[0,0];
document.addEventListener('mousemove', function(event) {
  mousePosition[0]=event.clientX,
  mousePosition[1]=event.clientY;
}, false);


  /*========================= GET WEBGL CONTEXT ========================= */
  var GL;
  try {
    GL = CANVAS.getContext("experimental-webgl", {antialias: false});
  } catch (e) {
    alert("You are not webgl compatible :(") ;
    return false;
  }

  /*========================= SHADERS ========================= */
  /*jshint multistr: true */
  var shader_vertex_source="\n\
attribute vec2 position;\n\
varying vec2 surfacePosition;\n\
void main(void) {\n\
gl_Position = vec4(position, 0., 1.);\n\
surfacePosition=position;\n\
}";


  var get_shader=function(source, type, typeString) {
    var shader = GL.createShader(type);
    GL.shaderSource(shader, source);
    GL.compileShader(shader);
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
      alert("ERROR IN "+typeString+ " SHADER : " + GL.getShaderInfoLog(shader));
      return false;
    }
    return shader;
  };

  var shader_vertex=get_shader(shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
  var shader_fragment_textarea=document.getElementById('fragmentSourceTextarea');

  var _position, SHADER_PROGRAM;

  var _resolution;
  var _time;
  var _mouse;
  var refresh_fragmentShader=function() {
    var shader_fragment = GL.createShader(GL.FRAGMENT_SHADER);
    GL.shaderSource(shader_fragment, (CODEVIEW)?CODEVIEW.getValue():shader_fragment_textarea.value);
    GL.compileShader(shader_fragment);
    if (GL.getShaderParameter(shader_fragment, GL.COMPILE_STATUS)) {
      SHADER_PROGRAM=GL.createProgram();

      GL.attachShader(SHADER_PROGRAM, shader_vertex);
      GL.attachShader(SHADER_PROGRAM, shader_fragment);

      GL.linkProgram(SHADER_PROGRAM);

      _mouse = GL.getUniformLocation(SHADER_PROGRAM, "mouse");
      _time = GL.getUniformLocation(SHADER_PROGRAM, "time");
      _resolution = GL.getUniformLocation(SHADER_PROGRAM, "resolution");
      _position = GL.getAttribLocation(SHADER_PROGRAM, "position");

      GL.enableVertexAttribArray(_position);

      GL.useProgram(SHADER_PROGRAM);
    }
  };
  refresh_fragmentShader();
  
  var CODEVIEW = CodeMirror.fromTextArea(shader_fragment_textarea,
    {
      lineNumbers: true,
      matchBrackets: true,
      indentWithTabs: true,
      tabSize: 8,
      indentUnit: 8
      ,mode: "text/x-glsl"
      ,onChange: refresh_fragmentShader      
    });
  for (var i=0; i<CODEVIEW.lineCount(); i++) {
    CODEVIEW.indentLine(i);
  };
  
  


  /*========================= THE TRIANGLE ========================= */
  //POINTS :
  var triangle_vertex=[
    -1,-1, //first summit -> bottom left of the viewport
    1,-1, //bottom right of the viewport
    1,1  //top right of the viewport
    ,-1,1
  ];

  var TRIANGLE_VERTEX= GL.createBuffer ();
  GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER,
                new Float32Array(triangle_vertex),
    GL.STATIC_DRAW);

  //FACES :
  var triangle_faces = [0,1,2, 0,2,3];
  
  var TRIANGLE_FACES= GL.createBuffer ();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(triangle_faces),
    GL.STATIC_DRAW);



  /*========================= DRAWING ========================= */
  GL.clearColor(0.0, 0.0, 0.0, 0.0);

  var animate=function(timestamp) {

    GL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
    GL.clear(GL.COLOR_BUFFER_BIT);

    GL.uniform2fv(_mouse, mousePosition);
    GL.uniform1f(_time, timestamp*0.001);
    GL.uniform2f(_resolution, CANVAS.width, CANVAS.height);
    GL.bindBuffer(GL.ARRAY_BUFFER, TRIANGLE_VERTEX);
    GL.vertexAttribPointer(_position, 2, GL.FLOAT, false,4*2,0) ;

    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
    GL.drawElements(GL.TRIANGLES, 6, GL.UNSIGNED_SHORT, 0);
    GL.flush();

    window.requestAnimationFrame(animate);
  };

  animate(0);
};