import * as THREE from 'three';
import 'three/examples/js/loaders/MTLLoader';
import 'three/examples/js/loaders/OBJLoader';
import * as React from "react";
import { Page } from '../types';
import { OrbitControls } from '../OrbitControls';
import { Variant, fromVariant, Move, MoveInfo } from '../types';

interface MoveObj {
  obj: THREE.Object3D;
  info: MoveInfo;
}
interface BoardProps {
  switchPage: (p: Page) => () => void;
  size: number;
  variant: Variant;
  singlePlayer: boolean;
}
export class Board extends React.Component<BoardProps, {}> {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  domElement: HTMLElement;
  tiles: THREE.Object3D[] = [];
  pieces: (MoveObj | null)[][];
  scene: THREE.Scene;
  moves = {
    played: [] as MoveObj[],
    undone: [] as MoveObj[],
  };
  mouse: THREE.Vector2;
  waitingForReply = false;

  componentDidMount() {
    const size = this.props.size;

    this.domElement = document.getElementById('container');
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.domElement.clientWidth, this.domElement.clientHeight);
    this.domElement.appendChild(this.renderer.domElement);

    this.scene = prepareScene();
    this.camera = makeCamera();
    this.tiles = generateBoard(size, size, this.scene);
    this.pieces = Array.from({ length: size }).map(x => Array.from<{}, null>({ length: size }).fill(null));

    const controls = makeControls(this.camera, this.renderer);
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();

    window.addEventListener('click', this.onClick);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.onClick);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('resize', this.onWindowResize);
  }

  shouldComponentUpdate() {
    return false;
  }

  onMouseDown = (e: any) => {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      - ((e.clientY - rect.top) / rect.height) * 2 + 1
    );
  }

  onClick = (e: any) => {
    e.preventDefault();
    const rect = this.domElement.getBoundingClientRect();
    const mouseEnd = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      - ((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    if (!this.mouse || mouseEnd.distanceTo(this.mouse) > 0.0001) {
      return;
    }
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouseEnd, this.camera);
    const intersects = raycaster.intersectObjects(this.tiles);
    if (intersects.length <= 0) {
      return;
    }
    const selected = intersects[0].object;
    this.place(selected.position.x, selected.position.y);
  }

  goBack = () => {
    if (this.moves.played.length <= 0) {
      return;
    }
    const m = this.moves.played.pop();
    this.scene.remove(m.obj);
    this.moves.undone.push(m);
    this.pieces[m.info.x][m.info.y] = null;
    if (!m.info.isX) {
      this.goBack();
    }
  }

  goForward = () => {
    if (this.moves.undone.length <= 0) {
      return;
    }
    const m = this.moves.undone.pop();
    this.scene.add(m.obj);
    this.moves.played.push(m);
    this.pieces[m.info.x][m.info.y] = m;
    if (m.info.isX) {
      this.goForward();
    }
  }

  place(x: number, y: number) {
    const tileX = (x + this.props.size) / 2;
    const tileY = (y + this.props.size) / 2;

    if (this.waitingForReply || this.pieces[tileX][tileY] != null) {
      return;
    }
    const wasX = this.moves.played.length ?
      this.moves.played[this.moves.played.length - 1].info.isX :
      false;
    const move = wasX
      ? { info: { x: tileX, y: tileY, isX: false }, obj: makeO() }
      : {
        info: {
          x: tileX, y: tileY, isX: true
        }, obj: makeX()
      };
    move.obj.position.set(x, y, .25);

    this.scene.add(move.obj);
    this.moves.played.push(move);
    this.moves.undone = [];
    this.pieces[tileX][tileY] = move;
    if (this.isWinner(tileX, tileY)) {
      console.log("winner");
    }
    if (!wasX) {
      this.waitForMove();
    }
  }

  waitForMove() {
    this.waitingForReply = true;
    setTimeout(() => {
      const move = findMove(this.pieces);
      this.waitingForReply = false;
      this.place((move.x * 2 - this.props.size), (move.y * 2 - this.props.size));
    }, 500);
  }

  isWinner(x: number, y: number): boolean {
    const wanted = this.moves.played[this.moves.played.length - 1].info.isX;
    const variant = fromVariant(this.props.variant);

    const ranges = [range(-1, -variant), range(1, variant)];
    const diagL = (i: number) => (this.pieces[x + i] || [])[y - i];
    const diagR = (i: number) => (this.pieces[x + i] || [])[y + i];
    const verti = (i: number) => (this.pieces[x + i] || [])[y];
    const horiz = (i: number) => (this.pieces[x] || [])[y + i];

    const consecutiveBools = (s: number = 0, xs: boolean[]) => {
      let i = 0;
      while (i < xs.length && xs[i]) i++;
      return s + i;
    }
    return [diagL, diagR, verti, horiz]
      .map((f: (x: number) => MoveObj) => ranges
        .map(xs => xs.map(f).map(x => x && x.info && x.info.isX === wanted))
        .reduce(consecutiveBools, 0))
      .some(x => x + 1 >= variant);
  }

  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    const { switchPage } = this.props;
    return <div className="wrapper">
      <div className="header">
        <a href="#" onClick={switchPage(Page.Home)} className="back">
          <img src="assets/left.png" height="12" /> Back
        </a>
        <div className="title"></div>
        <div>
          <a href="#" onClick={this.goBack} className="goBack">
            <img src="assets/left.png" height="12" />
          </a>
        </div>
        <div>
          <a href="#" onClick={this.goForward} className="goForward">
            <img src="assets/right.png" height="12" />
          </a>
        </div>
        <div><b>Menu</b></div>
      </div>
      <div id="container"></div>
    </div>;
  }
}

function prepareScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc);

  // lights
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 0, 20);
  light.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(light);

  const light2 = new THREE.DirectionalLight(0xaaaaaa);
  light2.position.set(-1, -1, -1);
  scene.add(light2);

  const light3 = new THREE.AmbientLight(0x555555);
  scene.add(light3);

  return scene;
}

function makeCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 20;
  camera.up.set(0, 0, 1);
  return camera;
}

function makeControls(camera: THREE.Camera, renderer: THREE.Renderer): any {
  const controls = new (OrbitControls as any)(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.rotateSpeed = 0.4;
  return controls;
}

function makeX() {
  const xShape = new THREE.Shape();
  xShape.moveTo(-0.05, -0.25);
  xShape.lineTo(0.05, -0.25);
  xShape.lineTo(0.05, -0.05);
  xShape.lineTo(0.25, -0.05);
  xShape.lineTo(0.25, 0.05);
  xShape.lineTo(0.05, 0.05);
  xShape.lineTo(0.05, 0.25);
  xShape.lineTo(-0.05, 0.25);
  xShape.lineTo(-0.05, 0.05);
  xShape.lineTo(-0.25, 0.05);
  xShape.lineTo(-0.25, -0.05);
  xShape.lineTo(-0.05, -0.05);
  xShape.lineTo(-0.05, -0.25);

  const obj = new THREE.Mesh(
    new THREE.ExtrudeGeometry(xShape, {
      amount: 0.2, bevelEnabled: false, bevelSegments: 2,
      steps: 2, bevelSize: 1, bevelThickness: 1
    }),
    new THREE.MeshPhongMaterial({ color: 0x00ff00, side: THREE.DoubleSide }),
  );
  obj.scale.set(2.7, 2.7, 1);
  obj.rotation.set(0, 0, Math.PI / 4);
  return obj;
}

function makeO() {
  return new THREE.Mesh(
    new THREE.TorusGeometry(0.6, 0.2, 12, 45),
    new THREE.MeshPhongMaterial({ color: 0xff0000 }),
  );
}

function generateBoard(xSize: number, ySize: number, scene: THREE.Scene): THREE.Object3D[] {
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
  const tileMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1
  });
  const objs: THREE.Object3D[] = [];

  range(0, xSize).forEach((x) => {
    range(0, ySize).forEach((y) => {
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.addAttribute('position', new THREE.Float32BufferAttribute([
        1, 1, .25, -1, 1, .25, -1, -1, .25, 1, -1, .25, 1, 1, .25,
        1, 1, -.25, 1, -1, -.25, 1, -1, .25, 1, -1, -.25, -1, -1, -.25,
        -1, -1, .25, -1, -1, -.25, -1, 1, -.25, -1, 1, .25, -1, 1, -.25,
        1, 1, -.25, 1, 1, .25,
      ], 3));
      lineGeometry.computeBoundingSphere();

      const line = new THREE.Line(lineGeometry, lineMaterial)
      const tile = new THREE.Mesh(new THREE.BoxBufferGeometry(2, 2, .5), tileMaterial);
      line.position.x = tile.position.x = x * 2 - xSize;
      line.position.y = tile.position.y = y * 2 - ySize;

      scene.add(line);
      scene.add(tile);
      objs.push(tile);
    });
  });

  return objs;
}

function range(start: number, end: number) {
  const increasing = end >= start;
  return Array.from(
    { length: Math.abs(end - start) },
    (v, k) => start + (increasing ? k : -k)
  );
}

function findMove(board: (MoveObj | null)[][]): MoveInfo {
  while (true) {
    const x = Math.floor(Math.random() * board.length);
    const y = Math.floor(Math.random() * board.length);
    if (board[x][y] === null) {
      return { x, y, isX: false };
    }
  }
}
