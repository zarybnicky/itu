import * as THREE from 'three';
import 'three/examples/js/loaders/MTLLoader';
import 'three/examples/js/loaders/OBJLoader';
import * as React from "react";
import { Page } from '../types';
import { OrbitControls } from '../OrbitControls';

interface BoardProps {
  switchPage: (p: Page) => () => void;
}
export class Board extends React.Component<BoardProps, {}> {
  componentDidMount() {
    var camera: any, controlsOrbit: any, scene: any, renderer: any;

    init();
    render(); // remove when using next line for animation loop (requestAnimationFrame)
    animate();

    function init() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xcccccc);

      var container = document.getElementById('container');
      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
      camera.position.z = 20;
      camera.up.set(0, 0, 1);

      controlsOrbit = new (OrbitControls as any)(camera, renderer.domElement);
      controlsOrbit.addEventListener('change', render); // remove when using animation loop
      // enable animation loop when using damping or autorotation
      controlsOrbit.enableDamping = true;
      controlsOrbit.dampingFactor = 0.25;
      controlsOrbit.rotateSpeed = 0.4;

      var mtlLoader = new THREE.MTLLoader();
      mtlLoader.load('assets/board.mtl', function(materials) {
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load('assets/board.obj', function(object) {
          object.scale.x = 1;
          object.scale.y = 1;
          object.scale.z = 1;
          object.rotateX(-30);
          object.receiveShadow = true;
          scene.add(object);
        });
      });

      /* var geometry = new THREE.BoxBufferGeometry(10, 10, 1);
       * var material = new THREE.MeshPhongMaterial({color: 0xff00ff });
       * var mesh = new THREE.Mesh(geometry, material);
       * scene.add(mesh);*/

      // lights
      let light: any = new THREE.DirectionalLight(0xffffff);
      light.position.set(1, 1, 1);
      scene.add(light);

      light = new THREE.DirectionalLight(0xaaaaaa);
      light.position.set(-1, -1, -1);
      scene.add(light);

      light = new THREE.AmbientLight(0x222222);
      scene.add(light);

      window.addEventListener('resize', onWindowResize, false);
    }

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
