
AFRAME.registerComponent('path-terrain-gradient', {
  schema: {
    points: { type: 'string' }, // "x1,z1 x2,z2 x3,z3"
    width: { type: 'number', default: 3 },
    color: { type: 'color', default: '#8B5A2B' }, // основной цвет
    edgeColor: { type: 'color', default: '#654321' }, // края
    groundSelector: { type: 'selector', default: '#GroundEntity' }
  },

  init: function () {
    this.segments = [];
    this._build();
  },

  parsePoints: function () {
    const parts = this.data.points.trim().split(/\s+/);
    return parts.map(p => {
      const [x,z] = p.split(',').map(Number);
      const y = this.sampleHeight(x, z);
      return new THREE.Vector3(x, y + 0.01, z);
    });
  },

  sampleHeight: function(x,z) {
    const ground = this.data.groundSelector;
    if (!ground) return 0;
    const mesh = ground.getObject3D('mesh');
    if (!mesh) return 0;
    const origin = new THREE.Vector3(x, 1000, z);
    const ray = new THREE.Raycaster(origin, new THREE.Vector3(0,-1,0), 0, 2000);
    const intersects = ray.intersectObject(mesh, true);
    return intersects.length > 0 ? intersects[0].point.y : 0;
  },

  buildSegment: function(p0,p1) {
    const length = p0.distanceTo(p1);
    const geometry = new THREE.PlaneBufferGeometry(this.data.width, length, 1, 1);
    geometry.rotateX(-Math.PI/2);

    // градиент краёв
    const colors = [];
    const mainColor = new THREE.Color(this.data.color);
    const edgeColor = new THREE.Color(this.data.edgeColor);

    geometry.attributes.position.array.forEach((v,i) => {
      if (i % 3 === 0) return;
      const x = geometry.attributes.position.array[i-2];
      const t = Math.abs(x) / (this.data.width/2);
      const col = mainColor.clone().lerp(edgeColor, t);
      colors.push(col.r, col.g, col.b);
    });
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    const mid = new THREE.Vector3().addVectors(p0,p1).multiplyScalar(0.5);
    mesh.position.copy(mid);

    const dir = new THREE.Vector3().subVectors(p1,p0).normalize();
    const yaw = Math.atan2(dir.x, dir.z);
    mesh.rotateY(yaw);

    this.el.object3D.add(mesh);
    this.segments.push(mesh);
  },

  _build: function() {
    const pts = this.parsePoints();
    for (let i = 0; i < pts.length-1; i++) {
      this.buildSegment(pts[i], pts[i+1]);
    }
  }
});

