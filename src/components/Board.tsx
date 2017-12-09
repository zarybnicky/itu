import * as THREE from 'three';
import 'three/examples/js/loaders/MTLLoader';
import 'three/examples/js/loaders/OBJLoader';
import * as React from "react";
import { Page } from '../types';
import { OrbitControls } from '../OrbitControls';

const range = (start: number, end: number) =>
  Array.from({ length: (end - start) }, (v, k) => k + start);

interface BoardProps {
  switchPage: (p: Page) => () => void;
}
export class Board extends React.Component<BoardProps, {}> {
  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    let camera: any, controlsOrbit: any, scene: any, renderer: any;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);

    let container = document.getElementById('container');
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 20;
    camera.up.set(0, 0, 1);

    controlsOrbit = new (OrbitControls as any)(camera, renderer.domElement);
    controlsOrbit.enableDamping = true;
    controlsOrbit.dampingFactor = 0.25;
    controlsOrbit.rotateSpeed = 0.4;

    // lights
    let light: any = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    scene.add(light);

    light = new THREE.DirectionalLight(0xaaaaaa);
    light.position.set(-1, -1, -1);
    scene.add(light);

    light = new THREE.AmbientLight(0x555555);
    scene.add(light);


    // Main model
    let lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    let faceMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });

    range(0, 9).forEach((x) => {
      range(0, 9).forEach((y) => {
        let lineGeometry = new THREE.BufferGeometry();
        lineGeometry.addAttribute('position', new THREE.Float32BufferAttribute([
          1, 1, .25, -1, 1, .25, -1, -1, .25, 1, -1, .25, 1, 1, .25,
          1, 1, -.25, 1, -1, -.25, 1, -1, .25, 1, -1, -.25, -1, -1, -.25,
          -1, -1, .25, -1, -1, -.25, -1, 1, -.25, -1, 1, .25, -1, 1, -.25,
          1, 1, -.25, 1, 1, .25,
        ], 3));
        lineGeometry.computeBoundingSphere();

        const line = new THREE.Line(lineGeometry, lineMaterial)
        const face = new THREE.Mesh(new THREE.BoxBufferGeometry(2, 2, .5), faceMaterial);
        line.position.x = face.position.x = x * 2 - 9;
        line.position.y = face.position.y = y * 2 - 9;

        scene.add(line);
        scene.add(face);
      });
    });

    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
      requestAnimationFrame(animate);
      controlsOrbit.update();
      render();
    }

    function render() {
      renderer.render(scene, camera);
    }
    render(); // remove when using next line for animation loop (requestAnimationFrame)
    animate();
  }
  render() {
    const { switchPage } = this.props;
    return <div className="wrapper">
      <div className="header">
        <a href="#" onClick={switchPage(Page.Home)} className="back">
          <img src="assets/left.png" height="12" /> Back
        </a>
        <div className="title"></div>
        <div><img src="assets/left.png" height="12" /></div>
        <div><img src="assets/right.png" height="12" /></div>
        <div><b>Menu</b></div>
      </div>
      <div id="container"></div>
    </div>;
  }
}
