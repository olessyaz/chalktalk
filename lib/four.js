
   var renderer = null;

   window.addEventListener('resize', function() {
      renderer.setSize(width(), height());
      renderer.camera.aspect = width() / height();
      renderer.camera.updateProjectionMatrix();
   });

   function toVec(src) {
      switch (src.length) {
      default: return new THREE.Vector2(src[0],src[1]);
      case 3 : return new THREE.Vector3(src[0],src[1],src[2]);
      case 4 : return new THREE.Vector4(src[0],src[1],src[2],src[3]);
      }
   }

   var _tmpVec_ = newVec3();

   THREE.Vector3.prototype.offset = function(x, y, z, q) {
      if (q === undefined)
         this.add(_tmpVec_.set(x,y,z));
      else
         this.add(_tmpVec_.set(x,y,z).applyQuaternion(q));
      return this;
   }

   THREE.Material.prototype.setUniform = function(name, src) {
      if (this.uniforms !== undefined && this.uniforms[name] !== undefined) {
         var val = src;
         if (Array.isArray(src)) {
            if (! Array.isArray(src[0]))
               val = toVec(src);
            else {
               val = [];
               for (var i = 0 ; i < src.length ; i++)
                  val.push(toVec(src[i]));
            }
         }
         this.uniforms[name].value = val;
      }
   }

   THREE.Object3D.prototype.setMaterial = function(material) {
      if (isShowingMeshEdges)
         material = bgMaterial();
      this.material = material;
      for (var i = 0 ; i < this.children.length ; i++)
         this.children[i].setMaterial(material);
      return this;
   }

   THREE.Object3D.prototype.setOpacity = function(opacity) {
      this.material.opacity = opacity;
      this.material.transparent = true;
      for (var i = 0 ; i < this.children.length ; i++)
         this.children[i].setOpacity(opacity);
      return this;
   }

   THREE.Object3D.prototype.getMatrix = function() {
      if (this.mat === undefined)
         this.mat = new M4();
      return this.mat;
   }

   THREE.Object3D.prototype.setMatrix = function(mat) {
      if (this.mat === undefined)
         this.mat = new M4();
      this.mat.copy(mat._m());
   }

   THREE.Object3D.prototype.updateMatrix = function() {
      if (this.mat === undefined)
         this.matrix.compose( this.position, this.quaternion, this.scale );
      else {
         var v = this.mat._m();
         this.matrix.set(v[0],v[4],v[ 8],v[12],
                         v[1],v[5],v[ 9],v[13],
                         v[2],v[6],v[10],v[14],
                         v[3],v[7],v[11],v[15]);
      }
      this.matrixWorldNeedsUpdate = true;
   }

   function cubeGeometry() { return new THREE.BoxGeometry(2, 2, 2); }
   function cylinderGeometry(n) { return new THREE.CylinderGeometry(1, 1, 2, n, n/2, false); }
   function globeGeometry(m,n, p0,p1, t0,t1) { return new THREE.SphereGeometry(1, m,n, p0,p1, t0,t1); }
   function latheGeometry(points, n) { return new THREE.LatheGeometry(points, n); }
   function nullGeometry() { return new THREE.Geometry(); }
   function openCylinderGeometry(n) { return new THREE.CylinderGeometry(1, 1, 2, n, 1, true); }
   function planeGeometry(n) { return new THREE.PlaneGeometry(2,2,n,n); }
   function torusGeometry(r, m, n) { return new THREE.TorusGeometry(1, r, m, n); }
   function quadrangleGeometry(a, b, c, d) {
      var geom = new THREE.Geometry();
      geom.vertices.push(a);
      geom.vertices.push(b);
      geom.vertices.push(c);
      geom.vertices.push(d);
      geom.faces.push(new THREE.Face3(0, 1, 2));
      geom.faces.push(new THREE.Face3(2, 3, 0));
      geom.faces.push(new THREE.Face3(2, 1, 0));
      geom.faces.push(new THREE.Face3(0, 3, 2));
      geom.computeFaceNormals(); 
      return geom;
   } 
   function triangleGeometry(a, b, c) {
      var geom = new THREE.Geometry();
      geom.vertices.push(a);
      geom.vertices.push(b);
      geom.vertices.push(c);
      geom.faces.push(new THREE.Face3(0, 1, 2));
      geom.faces.push(new THREE.Face3(2, 1, 0));
      geom.computeFaceNormals(); 
      return geom;
   } 
   function triangleStripGeometry(n) {
      var geom = new THREE.Geometry();
      var r = 1 / n;
      for (var i = 0 ; i <= 2 * n ; i++) {
         var vertex = newVec3((2 * i - n) * r, i % 2 == 0 ? -r/2 : r/2, 0);
         geom.vertices.push(vertex);
      }
      for (var i = 0 ; i < n ; i++) {
         geom.faces.push(new THREE.Face3(2 * i    , 2 * i + 1, 2 * i + 2));
         geom.faces.push(new THREE.Face3(2 * i + 1, 2 * i + 2, 2 * i + 3));
      }
   }

   function newVec2(x, y) {
      if (x === undefined) x = y = 0;
      if (y === undefined) y = 0;
      return new THREE.Vector2(x, y);
   }
   function newVec3(x, y, z) {
      if (x === undefined) x = y = z = 0;
      if (y === undefined) y = z = 0;
      if (z === undefined) z = 0;
      return new THREE.Vector3(x, y, z);
   }
   function newVec4(x, y, z, w) {
      if (x === undefined) x = y = z = w = 0;
      return new THREE.Vector4(x, y, z, w);
   }


   THREE.Object3D.prototype.addTorus = function(r, m, n) {
      var geometry = torusGeometry(r, m, n);
      var mesh = new THREE.Mesh( geometry, bgMaterial() );
      this.add(mesh);
      return mesh;
   }

   THREE.Object3D.prototype.addLathe = function(p, nSegments) {
      var points = [];
      for (var i = 0 ; i < p.length ; i++)
         points.push( new THREE.Vector3( p[i][0],p[i][1],p[i][2] ) );
      var geometry = latheGeometry( points, nSegments );
      var mesh = new THREE.Mesh(geometry, bgMaterial());
      this.add(mesh);
      return mesh;
   }

   THREE.Object3D.prototype.addCylinder = function(n) {
      if (n === undefined) n = 24;
      var geometry = cylinderGeometry(n);
      var mesh = new THREE.Mesh(geometry, bgMaterial());
      this.add(mesh);
      return mesh;
   }

   THREE.Object3D.prototype.addOpenCylinder = function(n) {
      if (n === undefined) n = 24;
      var geometry = openCylinderGeometry(n);
      var mesh = new THREE.Mesh(geometry, bgMaterial());
      this.add(mesh);
      return mesh;
   }

   THREE.Object3D.prototype.addCube = function() {
      var geometry = cubeGeometry();
      var mesh = new THREE.Mesh(geometry, bgMaterial());
      this.add(mesh);
      return mesh;
   }

   THREE.Object3D.prototype.addPlane = function() {
      var geometry = planeGeometry();
      var mesh = new THREE.Mesh(geometry, bgMaterial());
      this.add(mesh);
      return mesh;
   }

   THREE.Object3D.prototype.addGlobe = function(m,n, p0,p1, t0,t1) {
      if (m === undefined) m = 32;
      if (n === undefined) n = floor(m / 2);
      var geometry = globeGeometry(m,n, p0,p1, t0,t1);
      var mesh = new THREE.Mesh(geometry, bgMaterial());
      this.add(mesh);
      return mesh;
   }

   THREE.Object3D.prototype.addNode = function() {
      var mesh = new THREE.Mesh();
      this.add(mesh);
      return mesh;
   }

   THREE.Object3D.prototype.addStick = function(r0, r1, n) {
      if (r1 === undefined) r1 = r0;
      if (n === undefined) n = 4;
      var tube = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, 2, n, 1, true));
      tube.rotation.x = Math.PI / 2;
      var stick = new THREE.Mesh(); 
      stick.add(tube);
      this.add(stick);
      return stick;
   }

   THREE.Object3D.prototype.addQuadrangle = function(a, b, c, d) {
      var geometry = quadrangleGeometry(a, b, c, d);
      var mesh = new THREE.Mesh( geometry, bgMaterial() );
      this.add(mesh);
      return mesh;
   }

   THREE.Object3D.prototype.addTriangle = function(a, b, c) {
      var geometry = triangleGeometry(a, b, c);
      var mesh = new THREE.Mesh( geometry, bgMaterial() );
      this.add(mesh);
      return mesh;
   }

   THREE.Object3D.prototype.placeStick = function(a, b) {
      this.position.copy(a).lerp(b, 0.5);
      this.lookAt(b);
      this.scale.z = a.distanceTo(b) / 2;
   }

   THREE.Geometry.prototype.computeEdges = function() {
      function testEdge(edges, a, b) {
         var h = Math.min(a, b) + "," + Math.max(a, b);
         if (hash[h] === undefined)
            hash[h] = n;
         else
            edges.push([hash[h], n, [a, b]]);
      }
      this.edges = [];
      var hash = {};
      for (var n = 0 ; n < this.faces.length ; n++) {
         var face = this.faces[n];
         testEdge(this.edges, face.a, face.b);
         testEdge(this.edges, face.b, face.c);
         testEdge(this.edges, face.c, face.a);
      }
   }

   THREE.Object3D.prototype.toStrokes = function() {
      return edgesToStrokes(this.projectVisibleEdges(this.findVisibleEdges()));
   }

   THREE.Object3D.prototype.findVisibleEdges = function(ve) {
      if (ve === undefined) {
         this.updateMatrixWorld();
         ve = [];
      }
      this.geometry.matrixWorld = this.matrixWorld;
      ve.push([ this.geometry, this.geometry.findVisibleEdges() ]);
      for (var k = 0 ; k < this.children.length ; k++)
         this.children[k].findVisibleEdges(ve);
      return ve;
   }

   THREE.Object3D.prototype.projectVisibleEdges = function(veds) {
      var e2 = [];

      function p2xy(p) { return [ projectX(p.x), projectY(p.y) ]; }
      function e2moveTo(p) { e2.push( [ p2xy(p) ] ); }
      function e2lineTo(p) {
         var e = e2[e2.length-1];
         var xy = p2xy(p);
         if (e[0][0] == xy[0] && e[0][1] == xy[1])
            e2.splice(e2.length-1, 1);
         else
            e.push(xy);
      }

      var E0 = new THREE.Vector3();
      var E1 = new THREE.Vector3();

      for (var k = 0 ; k < veds.length ; k++) {
         var geom  = veds[k][0];
         var edges = veds[k][1];

         for (var n = 0 ; n < edges.length ; n++) {
            var V0 = geom.vertexWorld(edges[n][0]);
            var V1 = geom.vertexWorld(edges[n][1]);

            var d = V0.distanceTo(V1);
            var nSteps = max(1, floor(d / 0.03));
            E1.copy(V0);
            var wasHidden = this.isHiddenPoint(E1);
            if (! wasHidden)
               e2moveTo(E1);
            for (var step = 1 ; step <= nSteps ; step++) {
               E0.copy(E1);
               E1.copy(V0).lerp(V1, step / nSteps);
               var isHidden = this.isHiddenPoint(E1);
               if (! wasHidden && isHidden)
                  e2lineTo(E0);
               if (wasHidden && ! isHidden)
                  e2moveTo(E1);
               wasHidden = isHidden;
            }
            if (! wasHidden)
               e2lineTo(E1);
         }
      }

      return e2;
   }

   THREE.Object3D.prototype.isHiddenPoint = function(p) {
      if (this.geometry.isHiddenPoint(p))
         return true;
      for (var k = 0 ; k < this.children.length ; k++)
         if (this.children[k].isHiddenPoint(p))
            return true;
      return false;
   }

   THREE.Geometry.prototype.findVisibleEdges = function() {
      var visibleEdges = [];

      if (this.edges === undefined)
         this.computeEdges();
      var normalMatrix = new THREE.Matrix3().getNormalMatrix(this.matrixWorld);

      // COMPUTE VIEW DEPENDENT NORMAL FOR EVERY FACE.

      for (var n = 0 ; n < this.faces.length ; n++) {
         var face = this.faces[n];
         if (face.viewNormal === undefined)
            face.viewNormal = new THREE.Vector3();
         face.viewNormal.copy(face.normal).applyMatrix3(normalMatrix).normalize();
      }

      // FIND EDGES THAT ARE EITHER LOCALLY SILHOUETTE OR DIHEDRAL.

      for (var n = 0 ; n < this.edges.length ; n++) {
         var edge = this.edges[n];
         var n0 = this.faces[edge[0]].viewNormal;
         var n1 = this.faces[edge[1]].viewNormal;

         if ((n0.z >= -0.0001 && n1.z <= 0.0001) ||
             (n0.z <= 0.0001 && n1.z >= -0.0001) || 
             (n0.dot(n1) < 0.5)) 
         {
             // console.log("v  dot = " + (n0.dot(n1).toFixed(6)) + ", " + n0.z.toFixed(6) + ", " + n1.z.toFixed(6)); 
             visibleEdges.push(edge[2]);
         }
         else {
             // console.log("nv dot = " + (n0.dot(n1).toFixed(6)) + ", " + n0.z.toFixed(6) + ", " + n1.z.toFixed(6)); 
         }
      }

      // console.log("fve: hidden point count = " + ___hiddenpoint_count.toFixed(0));
      ___hiddenpoint_count = 0;

      return visibleEdges;
   }

   THREE.Geometry.prototype.vertexWorld = function(i) {
      if (this.verticesWorld === undefined)
         this.verticesWorld = [];

      if (this.verticesWorld[i] === undefined)
         this.verticesWorld[i] = new THREE.Vector3();

      return this.verticesWorld[i].copy(this.vertices[i]).applyMatrix4(this.matrixWorld);
   }


   THREE.Geometry.prototype.addLine = function(t, a, b) {
      var dx = b.x - a.x, dy = b.y - a.y, d = sqrt(dx * dx + dy * dy);
      dx *= t/2 / d;
      dy *= t/2 / d;
      this.vertices.push(new THREE.Vector3(a.x + dy, a.y - dx, a.z + t));
      this.vertices.push(new THREE.Vector3(b.x + dy, b.y - dx, b.z + t));
      this.vertices.push(new THREE.Vector3(b.x - dy, b.y + dx, b.z + t));
      this.vertices.push(new THREE.Vector3(a.x - dy, a.y + dx, a.z + t));
      var nf = this.vertices.length;
      this.faces.push(new THREE.Face3(nf-4, nf-3, nf-2));
      this.faces.push(new THREE.Face3(nf-2, nf-1, nf-4));
   }

   THREE.Geometry.prototype.isHiddenPoint = function(p) {
      for (var n = 0 ; n < this.faces.length ; n++)
          if (this.isPointHiddenByFace(p, n)) {
              ___hiddenpoint_count++;
              return true;
          }

      return false;
   }

   THREE.Geometry.prototype.isPointHiddenByFace = function(p, n) {
      var face = this.faces[n];
      return isPointHiddenByTriangle(p, this.vertexWorld(face.a),
                                        this.vertexWorld(face.b),
                                        this.vertexWorld(face.c));
   }

   // Find out whether point p is hidden by triangle a,b,c.

   var isPointHiddenByTriangle = function(p, a, b, c) {
      var U = barycentric(p, a, b, c); if (U < 0) return false;
      var V = barycentric(p, b, c, a); if (V < 0) return false;
      var W = barycentric(p, c, a, b); if (W < 0) return false;
      var tz = U * a.z + V * b.z + W * c.z;
      // varous values have been tried for .001 and it does make some difference but
      // does not solve the problem of the missing silhouette edges
      return tz > p.z + 0.001;
   }

   // Compute one barycentric coordinate of a point in a triangle.

   function barycentric(p, a, b, c) {
      var A = c.y - b.y;
      var B = b.x - c.x;
      var C = -A * b.x - B * b.y;
      return (A * p.x + B * p.y + C) / (A * a.x + B * a.y + C);
   }

   function ik(a, b, C, D) {
      if (C instanceof THREE.Vector3) {
         var cc = C.dot(C), x = (1 + (a*a - b*b)/cc) / 2, y = C.dot(D)/cc;
         D.set(D.x - y * C.x, D.y - y * C.y, D.z - y * C.z);
         y = sqrt(max(0,a*a - cc*x*x) / D.dot(D));
         D.set(x*C.x + y*D.x, x*C.y + y*D.y, x*C.z + y*D.z);
      }
      else {
         var cc = dot(C,C), x = (1 + (a*a - b*b)/cc) / 2, y = dot(C,D)/cc;
         for (var i = 0 ; i < 3 ; i++) D[i] -= y * C[i];
         y = sqrt(max(0,a*a - cc*x*x) / dot(D,D));
         for (var i = 0 ; i < 3 ; i++) D[i] = x * C[i] + y * D[i];
      }
   }

   function matToEuler(mat, e) {
      e.y = asin(mat[0+4*2]);
      var C = cos(e.y);
      if (abs(C) > 0.005) {
         e.x = -atan2( mat[1+4*2] / C, mat[2+4*2] / C);
         e.z =  atan2(-mat[0+4*1] / C, mat[0+4*0] / C);
      }
      else {
         e.x =  0;
         e.z =  atan2( mat[1+4*0] / C, mat[1+4*1] / C);
      }
   }

   function ambientLight(color) {
      return new THREE.AmbientLight(color);
   }

   function directionalLight(x, y, z, color) {
      var myLight = new THREE.DirectionalLight(color);
      myLight.position.set(x,y,z).normalize();
      return myLight;
   }

   function phongMaterial(ambient, diffuse, shiny, power) {
      if (ambient === undefined) ambient = 0;
      if (diffuse === undefined) diffuse = 0;
      if (shiny   === undefined) shiny   = 0;
      if (power   === undefined) power   = 1;
      return new THREE.MeshPhongMaterial({
         ambient  : ambient,
         emissive : 0,
         color    : diffuse,
         specular : shiny,
         shininess: power
      });
   }

   function newColor(r,g,b) {
      var red = floor(255 * r);
      var grn = floor(255 * g);
      var blu = floor(255 * b);
      return new THREE.Color((red << 16) + (grn << 8) + blu);
   }

   THREE.Material.prototype.setAmbient = function(r,g,b) {
      this.emissive = newColor(r, g, b);
      return this;
   }

   THREE.Material.prototype.setDiffuse = function(r,g,b) {
      this.color = newColor(r, g, b);
      return this;
   }

   THREE.Material.prototype.setSpecular = function(r,g,b,p) {
      this.specular = newColor(r, g, b);
      this.shininess = p;
      return this;
   }

   var blackMaterial = new phongMaterial(0x000000,0x000000,0x000000,20);
   var whiteMaterial = new phongMaterial().setAmbient(.4,.4,.4).setDiffuse(.3,.3,.3);

   function node() {
      return new THREE.Mesh();
   }

   function animate(){
      var time = (new Date()).getTime() / 1000;
      var elapsed = this.time === undefined ? .03 : time - this.time;
      this.time = time;
      updateScene(elapsed);
      renderer.render(renderer.scene, renderer.camera);
      requestAnimationFrame(function(){ animate(); });
   }

   var renderer, cameraFOV = 15, mouseX = 0, mouseY = 0;

   function fourStart() {
      renderer = new THREE.WebGLRenderer( { alpha: true } );
      renderer.setClearColor(0x000000, 0);
      renderer.setSize(width(), height());

      document.addEventListener('mousemove', function(event) {
         mouseX = event.clientX;
         mouseY = event.clientY;
      }, false);

      renderer.camera = new THREE.PerspectiveCamera(cameraFOV/20,width()/height(),1,1100);
      renderer.camera.position.set(0,0,10*20);
   }

function gl() { return renderer.context; }
function isValidVertexShader  (string) {
   return isValidShader(gl().VERTEX_SHADER,
   string);
}
function isValidFragmentShader(string) { return isValidShader(gl().FRAGMENT_SHADER, string); }
function isValidShader(type, string) {
   var shader = gl().createShader(type);
   gl().shaderSource(shader, string);
   gl().compileShader(shader);
   var status = gl().getShaderParameter(shader, gl().COMPILE_STATUS);
   if (! status)
      console.log(gl().getShaderInfoLog(shader));
   return status;
};

function addUniforms(material, string) {

   // PARSE THE SHADER CODE TO FIND CUSTOM UNIFORMS:

   var typeInfo = "float f 0 vec2 v2 0 vec3 v3 0 vec4 v4 0".split(' ');
   var declarations = string.substring(0, string.indexOf("void main")).split(";");
   for (var i = 0 ; i < declarations.length ; i++) {
      var declaration = declarations[i].trim();
      if (declaration.length > 0) {
         var words = declaration.split(" ");
         if (words[0] == 'uniform') {
            var type = words[1];
            var name = words[2];
            var j = name.indexOf('[');
            if (j >= 0)
               name = name.substring(0, j);
            for (var n = 0 ; n < typeInfo.length ; n += 3) {
               if (type == typeInfo[n]) {
                  var key = typeInfo[n+1];
                  var val = typeInfo[n+2];
                  if (j >= 0) {
                     key += 'v';
		     if (key == 'fv')
		        key = 'fv1';
                     val = '[]';
                  }
                  material.uniforms[name] = { type: key, value: val };
                  break;
               }
            }
         }
      }
   }
}

// PREPEND THE HEADER OF PREDEFINED THINGS TO SYNTAX CHECK A VERTEX SHADER:
function formSyntaxCheckVertexShader(string) {
   return syntaxCheckVertexShaderHeader.concat(string);
}

// PREPEND THE HEADER OF PREDEFINED THINGS TO A VERTEX SHADER:
function formVertexShader(string) {
   return vertexShaderHeader.concat(string);
}

// PREPEND THE HEADER OF PREDEFINED THINGS TO A FRAGMENT SHADER:
function formFragmentShader(string) {
   return fragmentShaderHeader.concat(string);
}

function shaderMaterial(vertexShaderString, fragmentShaderString) {
   var material = new THREE.ShaderMaterial({
      uniforms: {}
   });

   material.vertexShader = formVertexShader(vertexShaderString);

   var u = "alpha uAlpha mx my mz pixelSize selectedIndex uTime x y z".split(' ');
   for (var i = 0 ; i < u.length ; i++)
      material.uniforms[u[i]] = { type: "f", value: (u[i]=="alpha" || u[i]=="uAlpha" ? 1 : 0) };

   material.uniforms.uCursor = { type: "v3", value: newVec3() };

   addUniforms(material, fragmentShaderString);
   material.fragmentShader = formFragmentShader(fragmentShaderString);

   return material;
}

// THIS VERTEX SHADER WILL SUFFICE FOR MOST SHADER PLANES:

var defaultVertexShader = [
   ,'varying vec3 vPosition;'
   ,'varying vec3 vNormal;'
   ,'float displace(vec3 p) { return 0.; }'
   ,'void main() {'
   ,'   vNormal = normalize((modelViewMatrix * vec4(normal, 0.)).xyz);'
   ,'   vPosition = position;'
   ,'   float _d = displace(position);'
   ,'   float _x = displace(position + vec3(.001, 0., 0.));'
   ,'   float _y = displace(position + vec3(0., .001, 0.));'
   ,'   float _z = displace(position + vec3(0., 0., .001));'
   ,'   vNormal = normalize(vNormal + vec3(_x - _d, _y - _d, _z - _d) / .001);'
   ,'   gl_Position = projectionMatrix * modelViewMatrix * vec4(position * (1. - _d), 1.);'
   ,'}'
].join("\n");

var defaultFragmentShader = [
    'uniform vec3 ambient;'
   ,'uniform vec3 diffuse;'
   ,'uniform vec4 specular;'
   ,'uniform vec3 Lrgb[3];'
   ,'uniform vec3 Ldir[3];'
   ,'void main() {'
   ,'   vec3  color = ambient;'
   ,'   vec3  W     = vec3(0.,0.,-1.);'
   ,'   vec3  N     = normalize(vNormal);'
   ,'   vec3  R     = W - 2. * N * dot(N, W);'
   ,'   for (int i = 0 ; i < 3 ; i++) {'
   ,'      vec3  L = normalize(Ldir[i]);'
   ,'      float D = dot(N, L);'
   ,'      float S = dot(R, L);'
   ,'      color += Lrgb[i] * ( diffuse * mix(max(0.,D),max(0.,.5+.5*D),.5) +'
   ,'                           specular.rgb * pow(max(0., S), specular.a) );'
   ,'   }'
   ,'   gl_FragColor = vec4(sqrt(color), uAlpha);'
   ,'}'
].join("\n");

// DEFINES FRAGMENT SHADER FUNCTIONS noise() and turbulence() AND VARS x, y, uTime and uAlpha.

var sharedHeader = [
 'precision highp float;'
,'vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }'
,'vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }'
,'vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }'
,'vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }'
,'vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }'
,'float noise(vec3 P) {'
,'   vec3 i0 = mod289(floor(P)), i1 = mod289(i0 + vec3(1.0));'
,'   vec3 f0 = fract(P), f1 = f0 - vec3(1.0), f = fade(f0);'
,'   vec4 ix = vec4(i0.x, i1.x, i0.x, i1.x), iy = vec4(i0.yy, i1.yy);'
,'   vec4 iz0 = i0.zzzz, iz1 = i1.zzzz;'
,'   vec4 ixy = permute(permute(ix) + iy), ixy0 = permute(ixy + iz0), ixy1 = permute(ixy + iz1);'
,'   vec4 gx0 = ixy0 * (1.0 / 7.0), gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;'
,'   vec4 gx1 = ixy1 * (1.0 / 7.0), gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;'
,'   gx0 = fract(gx0); gx1 = fract(gx1);'
,'   vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0), sz0 = step(gz0, vec4(0.0));'
,'   vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1), sz1 = step(gz1, vec4(0.0));'
,'   gx0 -= sz0 * (step(0.0, gx0) - 0.5); gy0 -= sz0 * (step(0.0, gy0) - 0.5);'
,'   gx1 -= sz1 * (step(0.0, gx1) - 0.5); gy1 -= sz1 * (step(0.0, gy1) - 0.5);'
,'   vec3 g0 = vec3(gx0.x,gy0.x,gz0.x), g1 = vec3(gx0.y,gy0.y,gz0.y),'
,'        g2 = vec3(gx0.z,gy0.z,gz0.z), g3 = vec3(gx0.w,gy0.w,gz0.w),'
,'        g4 = vec3(gx1.x,gy1.x,gz1.x), g5 = vec3(gx1.y,gy1.y,gz1.y),'
,'        g6 = vec3(gx1.z,gy1.z,gz1.z), g7 = vec3(gx1.w,gy1.w,gz1.w);'
,'   vec4 norm0 = taylorInvSqrt(vec4(dot(g0,g0), dot(g2,g2), dot(g1,g1), dot(g3,g3)));'
,'   vec4 norm1 = taylorInvSqrt(vec4(dot(g4,g4), dot(g6,g6), dot(g5,g5), dot(g7,g7)));'
,'   g0 *= norm0.x; g2 *= norm0.y; g1 *= norm0.z; g3 *= norm0.w;'
,'   g4 *= norm1.x; g6 *= norm1.y; g5 *= norm1.z; g7 *= norm1.w;'
,'   vec4 nz = mix(vec4(dot(g0, vec3(f0.x, f0.y, f0.z)), dot(g1, vec3(f1.x, f0.y, f0.z)),'
,'                      dot(g2, vec3(f0.x, f1.y, f0.z)), dot(g3, vec3(f1.x, f1.y, f0.z))),'
,'                 vec4(dot(g4, vec3(f0.x, f0.y, f1.z)), dot(g5, vec3(f1.x, f0.y, f1.z)),'
,'                      dot(g6, vec3(f0.x, f1.y, f1.z)), dot(g7, vec3(f1.x, f1.y, f1.z))), f.z);'
,'   return 2.2 * mix(mix(nz.x,nz.z,f.y), mix(nz.y,nz.w,f.y), f.x);'
,'}'
,'float noise(vec2 P) { return noise(vec3(P, 0.0)); }'
,'float fractal(vec3 P) {'
,'   float f = 0., s = 1.;'
,'   for (int i = 0 ; i < 9 ; i++) {'
,'      f += noise(s * P) / s;'
,'      s *= 2.;'
,'      P = vec3(.866 * P.x + .5 * P.z, P.y + 100., -.5 * P.x + .866 * P.z);'
,'   }'
,'   return f;'
,'}'
,'float turbulence(vec3 P) {'
,'   float f = 0., s = 1.;'
,'   for (int i = 0 ; i < 9 ; i++) {'
,'      f += abs(noise(s * P)) / s;'
,'      s *= 2.;'
,'      P = vec3(.866 * P.x + .5 * P.z, P.y + 100., -.5 * P.x + .866 * P.z);'
,'   }'
,'   return f;'
,'}'
].join('\n');

// THE SYNTAX CHECKING VERSION ALSO INCLUDES VARS THAT WILL BE DECLARED BY THREE.JS.

var syntaxCheckVertexShaderHeader = [
 sharedHeader
,'precision highp float;'
,'uniform mat4  modelViewMatrix;'
,'uniform mat4  projectionMatrix;'
,'varying vec3  normal;'
,'varying vec3  position;'
,'uniform float uTime;'
,'uniform vec3  uCursor;'
,''
].join('\n');

var vertexShaderHeader = [
 sharedHeader
,'uniform float uTime;'
,''
].join('\n');

var fragmentShaderHeader = [
 sharedHeader
,'uniform float alpha;'
,'varying float dx;'
,'varying float dy;'
,'uniform float mx;'
,'uniform float my;'
,'uniform float mz;'
,'uniform float pixelSize;'
,'uniform float selectedIndex;'
,'uniform float uAlpha;'
,'uniform vec3  uCursor;'
,'uniform float uTime;'
,'varying vec3  vNormal;'
,'varying vec3  vPosition;'
,'uniform float x;'
,'uniform float y;'
,'uniform float z;'
,'   float raySphere(vec3 V, vec3 W, vec4 s) {'
,'      float b = 2. * dot(V -= s.xyz, W);'
,'      float c = dot(V, V) - s.w * s.w;'
,'      float d = b * b - 4. * c;'
,'      return d < 0. ? 1. / 0. : (-b - sqrt(d)) / 2.;'
,'   }'
,'   vec3 shadeDiffuseSphere(vec3 P, vec4 s, vec3 m, vec3 lightDir, vec3 lightColor) {'
,'      vec3 normal = (P - s.xyz) / s.w;'
,'      vec3 color = .2 * m;'
,'      float diffuse = max(0., dot(normal, lightDir));'
,'      color += lightColor * m * diffuse;'
,'      return color;'
,'   }'
,''
].join('\n');

   function createVisibleEdgesMesh(veds) {
      var material = new THREE.LineBasicMaterial();
      if (backgroundColor == 'white')
         material.color = new THREE.Color( 0 );
      var mesh = new THREE.Mesh(new THREE.Geometry(), material);

      for (var k = 0 ; k < veds.length ; k++) {
         var geom  = veds[k][0];
         var edges = veds[k][1];

         for (var n = 0 ; n < edges.length ; n++)
            mesh.geometry.addLine(.007, geom.vertexWorld(edges[n][0]),
                                        geom.vertexWorld(edges[n][1]));
      }

      return mesh;
   }

