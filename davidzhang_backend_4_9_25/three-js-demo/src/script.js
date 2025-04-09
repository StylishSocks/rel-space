import * as THREE from 'three';
// user controls library
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// STL loader
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

// create Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);



// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

ambientLight.intensity = 5;


/*
// cube model
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
*/

// load .STL Model

const loader = new STLLoader();
let mesh;

loader.load('public/models/model.stl', (geometry) => {
    try {
    // Center and scale the model
    geometry.computeBoundingBox();
    const center = geometry.boundingBox.getCenter(new THREE.Vector3());
    geometry.center();

    const size = geometry.boundingBox.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);
    const desiredSize = 3; // Adjust as needed
    geometry.scale(desiredSize / maxDimension, desiredSize / maxDimension, desiredSize / maxDimension);

    const material = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        console.log("Mesh created successfully");
    } catch (error) {
        console.error("Error creating mesh:", error);
    }
}, undefined, (error) => {
    console.error('An error happened loading the STL file:', error);
});



// user controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;


// position camera
camera.position.z = 5;


// animation loop 
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Color Picker Event Listener
const colorPicker = document.getElementById('colorPicker');
colorPicker.addEventListener('input', (event) => {
    console.log("Color picker changed:", event.target.value); 
    if (mesh && mesh.material) {
        mesh.material.color.set(event.target.value);
        console.log("Color set to:", event.target.value);
    } else {
        console.log("Mesh or material is missing.");
    }
});

