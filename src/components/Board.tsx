import * as THREE from 'three';
import 'three/examples/js/loaders/MTLLoader';
import 'three/examples/js/loaders/OBJLoader';
import * as React from "react";
import { Page } from '../types';
import { OrbitControls } from '../OrbitControls';

interface Move {
  player: 'x' | 'o';
  x: number;
  y: number;
}
interface BoardProps {
  switchPage: (p: Page) => () => void;
}
export class Board extends React.Component<BoardProps, {}> {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  domElement: HTMLElement;
  tiles: THREE.Object3D[] = [];
  pieces: (THREE.Object3D | null)[][];
  scene: THREE.Scene;
  inGameShape: number;
  moves = {
    played: [] as Move[],
    undone: [] as Move[],
  };
  mouse: THREE.Vector2;
  moveIndex: number = -1;
  myMoves: Array<THREE.Object3D> = [];

  componentDidMount() {
    this.domElement = document.getElementById('container');
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.domElement.clientWidth, this.domElement.clientHeight);
    this.domElement.appendChild(this.renderer.domElement);

    this.scene = prepareScene();
    this.camera = makeCamera();
    this.tiles = generateBoard(9, 9, this.scene);
    this.pieces = Array.from({ length: 9 }).map(x => Array.from<{}, null>({ length: 9 }).fill(null));
    this.inGameShape = 1;

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
      if(this.moveIndex <= -1) {
          return;
      }
    this.scene.remove(this.scene.getObjectById(this.myMoves[this.moveIndex].id));
    this.moveIndex--;
  }

  goForward = (e: any) => {
      if(this.moveIndex >= this.myMoves.length - 1) {
          return;
     }

    this.moveIndex++;
    this.scene.add(this.myMoves[this.moveIndex]);
  }

  place(x: number, y: number) {
      const tileX = (x + 9) / 2;
      const tileY = (y + 9) / 2;
      if(!this.alreadyFull(tileX, tileY)) {
          return;
      }
    const mat = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const donutGeometry = new THREE.TorusGeometry( 0.6, 0.2, 12, 45 );
    var donut = {geometry: donutGeometry, material: mat};

    var xShape = new THREE.Shape();
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

    var extrudeSettings = { amount: 0.2, bevelEnabled: false, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1};
    var xGeometry = new THREE.ExtrudeGeometry( xShape, extrudeSettings );

    var placee;
    if (this.inGameShape)  {
      placee = new THREE.Mesh( xGeometry, new THREE.MeshPhongMaterial( { color: 0x00ff00, side: THREE.DoubleSide } ) );
      this.inGameShape = 0;
      placee.scale.set(2.7, 2.7, 1);
      placee.rotation.set(0, 0, Math.PI / 4);
    } else {
      placee = new THREE.Mesh( donut.geometry, donut.material );
      this.inGameShape = 1;
    }
    placee.position.x = x;
    placee.position.y = y;
    placee.position.z = .75;
    this.scene.add(placee);

    this.moveIndex++;
    this.myMoves = this.myMoves.slice(0, this.moveIndex);
    this.myMoves.push(placee);

    if (this.inGameShape) {
        placee.name = "O"
    }
    else {
        placee.name = "X"

    }
    this.pieces[tileX][tileY] = placee;
    if(this.isWinner(tileX, tileY)) {
        console.log("winner");
    }
  }

  isWinner(x:number, y:number):boolean {
      if(this.countPiecesHV(x, y, false) //horizontaly
      || this.countPiecesHV(x, y, true) //verticaly
      || this.countPiecesDiagLtoR(x, y) //left to right
      || this.countPiecesDiagRtoL(x, y)) { //right to left
          return true;
      }
      else {
          return false;
      }

  }

  countPiecesHV(x:number, y:number, orientation:boolean):boolean {
      var sizeOfBoard = 9;
      var sum = 0;
      var wanted;
      var tmp_x = x, tmp_y = y;

      if(this.inGameShape) {
          wanted = "O";
      }
      else {
          wanted = "X";
      }


      if (orientation == false) {
          tmp_x = x - 1;
      } else {
          tmp_y = y - 1;
      }

      while(tmp_x >= 0) {
          if (this.pieces[tmp_x][tmp_y] == null) {
              break;
          }
            if (this.pieces[tmp_x][tmp_y].name == wanted) {
                sum++;
                if (orientation == false) {
                    tmp_x--;
                } else {
                    tmp_y--;
                }
            }
            else {
                break;
            }
      }
      if (orientation == false) {
          tmp_x = x + 1;
      } else {
          tmp_y = y + 1;
      }

      while(tmp_x < sizeOfBoard) {
          if (this.pieces[tmp_x][tmp_y] == null) {
              break;
          }
            if (this.pieces[tmp_x][tmp_y].name == wanted) {
                sum++
                if (orientation == false) {
                    tmp_x++;
                } else {
                    tmp_y++;
                }
            }
            else {
                break;
            }
      }
    if (sum + 1 >= 5) {
        return true;
    } else {
        return false;
    }
  }

 countPiecesDiagLtoR(x:number, y:number):boolean {
     var sizeOfBoard = 9;
     var sum = 0;
     var wanted;
     var tmp_x = x, tmp_y = y;

     if(this.inGameShape) {
         wanted = "O";
     }
     else {
         wanted = "X";
     }
     tmp_x--;
     tmp_y--;
     while(tmp_x >= 0 && tmp_y >= 0) {
         if (this.pieces[tmp_x][tmp_y] == null) {
             break;
         }
           if (this.pieces[tmp_x][tmp_y].name == wanted) {
               sum++;
               tmp_x--;
               tmp_y--;
           }
           else {
               break;
           }
     }

     tmp_x = x;
     tmp_y = y;

     tmp_x++;
     tmp_y++;
     while(tmp_x < sizeOfBoard && tmp_y < sizeOfBoard) {
         if (this.pieces[tmp_x][tmp_y] == null) {
             break;
         }
           if (this.pieces[tmp_x][tmp_y].name == wanted) {
               sum++;
                   tmp_x++;
                   tmp_y++;
           }
           else {
               break;
           }
     }


     if (sum + 1 >= 5) {
         return true;
     }
     else {
         return false;
     }
 }

 countPiecesDiagRtoL(x:number, y:number):boolean {
     var sizeOfBoard = 9;
     var sum = 0;
     var wanted;
     var tmp_x = x, tmp_y = y;

     if(this.inGameShape) {
         wanted = "O";
     }
     else {
         wanted = "X";
     }

     tmp_x++;
     tmp_y--;
     while(tmp_x < sizeOfBoard && tmp_y >= 0) {
         if (this.pieces[tmp_x][tmp_y] == null) {
             break;
         }
           if (this.pieces[tmp_x][tmp_y].name == wanted) {
               sum++;
                   tmp_x++;
                   tmp_y--;
           }
           else {
               break;
           }
     }

     tmp_x = x;
     tmp_y = y;

     tmp_x--;
     tmp_y++;
     while(tmp_x >= 0 && tmp_y < sizeOfBoard) {
         if (this.pieces[tmp_x][tmp_y] == null) {
             break;
         }
           if (this.pieces[tmp_x][tmp_y].name == wanted) {
               sum++;
                   tmp_x--;
                   tmp_y++;
           }
           else {
               break;
           }
     }
     if (sum + 1 >= 5) {
         return true;
     }
     else {
         return false;
     }
 }

  alreadyFull(x: number, y:number): boolean  {
        if (this.pieces[x][y] == null) {
            return true;
        }
        return false;
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
  return Array.from({ length: (end - start) }, (v, k) => k + start);
}
