import * as THREE from 'three';
import 'three/examples/js/loaders/MTLLoader';
import 'three/examples/js/loaders/OBJLoader';
import * as React from "react";
import { Page } from '../types';
import { OrbitControls } from '../OrbitControls';
import { Variant, fromVariant, MoveInfo, range } from '../types';
import { findMove, isWinner } from '../game-logic';

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
  mouse: THREE.Vector2;
  controls: any;

  tiles: THREE.Object3D[] = [];
  pieces: MoveInfo[][];
  scene: THREE.Scene;
  moves = {
    played: [] as MoveObj[],
    undone: [] as MoveObj[],
  };
  waitingForReply = false;

  componentDidMount() {
    const size = this.props.size;

    this.domElement = document.getElementById('container');
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.domElement.clientWidth, this.domElement.clientHeight);
    this.domElement.appendChild(this.renderer.domElement);

    this.scene = prepareScene();
    this.camera = makeCamera();
    this.tiles = generateBoard(size, size, this.scene);
    this.pieces = Array.from({ length: size }).map(x => Array.from<{}, null>({ length: size }).fill(null));

    this.controls = makeControls(this.camera, this.renderer);
    const animate = () => {
      requestAnimationFrame(animate);
      this.controls.update();
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
    this.pieces[m.info.x][m.info.y] = m.info;
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
      : { info: { x: tileX, y: tileY, isX: true }, obj: makeX() };
    move.obj.position.x = x;
    move.obj.position.y = y;

    this.scene.add(move.obj);
    this.moves.played.push(move);
    this.moves.undone = [];
    this.pieces[tileX][tileY] = move.info;

    if (isWinner(this.pieces, move.info, this.props.variant)) {
      const text = document.getElementById('victory-text');
      const overlay = document.getElementById('overlay');
      text.innerHTML = wasX ? 'You lost.' : 'You won!';
      overlay.style.display = 'flex';
      this.waitingForReply = true;
    } else if (!wasX) {
      this.waitForMove();
    }
  }

  forfeit() {
    const overlay = document.getElementById('forfeitOverlay');
    overlay.style.display = 'flex';
  }

  resetGame = (e: any) => {
    e.stopPropagation();
    this.moves.played.forEach(x => this.scene.remove(x.obj));
    this.moves.played = [];
    this.moves.undone = [];
    this.pieces = Array.from({ length: this.props.size })
      .map(x => Array.from<{}, null>({ length: this.props.size }).fill(null));
    this.controls.reset();
    const overlay = document.getElementById('overlay');
    const ffOverlay = document.getElementById('forfeitOverlay');
    overlay.style.display = 'none';
    ffOverlay.style.display = 'none';
    this.waitingForReply = false;
  }

  waitForMove() {
    this.waitingForReply = true;
    setTimeout(() => {
      const move = findMove(this.pieces);
      this.waitingForReply = false;
      this.place((move.x * 2 - this.props.size), (move.y * 2 - this.props.size));
    }, 250);
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
        <div><a href="#" onClick={this.forfeit} className="forfeit">Forfeit</a></div>
      </div>
      <div id="container">
        <div id="overlay">
          <div className="menu">
            <div id="victory-text">You won!</div>
            <a href="#" onClick={this.resetGame}>New game</a>
            <a href="#" onClick={switchPage(Page.Home)}>Main menu</a>
          </div>
        </div>
        <div id="forfeitOverlay">
          <div className="menu">
            <div id="victory-text">You surrendered!</div>
            <a href="#" onClick={this.resetGame}>Reset game</a>
            <a href="#" onClick={switchPage(Page.Home)}>Main menu</a>
          </div>
        </div>
      </div>
    </div>;
  }
}

function prepareScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf4faff);

  // lights
  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 0, 10);
  light.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(light);

  const light3 = new THREE.AmbientLight(0xaaaaaa, .25);
  scene.add(light3);

  return scene;
}

function makeCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 25;
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
    new THREE.MeshPhongMaterial({ color: 0x05ff2b, side: THREE.DoubleSide }),
  );
  obj.scale.set(2.7, 2.7, 1);
  obj.rotation.set(0, 0, Math.PI / 4);
  obj.position.z = 0.25;
  return obj;
}

function makeO() {
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.6, 0.2, 12, 45),
    new THREE.MeshPhongMaterial({ color: 0xff0000 }),
  );
  mesh.position.z = 0.45;
  return mesh;
}

function generateBoard(xSize: number, ySize: number, scene: THREE.Scene): THREE.Object3D[] {
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0x2bd1eb, linewidth: 2 });
  const tileMaterial = new THREE.MeshPhongMaterial({
    color: 0x2b5593,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
    shininess: 15,
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
