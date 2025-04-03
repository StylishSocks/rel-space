import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js"

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// User Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;


let mesh, wireframe;

// Load model.json
fetch('models/model.json')
  .then(response => response.json())
  .then(data => {
    createModel(data);
  })
  .catch(error => console.error('Error loading JSON:', error));

  function createModel(data) {
    const geometry = new THREE.BufferGeometry();
  
    // Flatten vertices into a single array
    const vertices = new Float32Array(data.vertices.flat());
  
    // Flatten faces into a single array
    const indices = new Uint16Array(data.faces.flat());
  
    // Assign to geometry
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  
    // Compute normals for lighting
    geometry.computeVertexNormals();
  
    // Create a material
    const material = new THREE.MeshStandardMaterial({
      color: 0x8B0000,
      metalness: 0.3,
      roughness: 0.7
    });
  
    // Create mesh
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

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
  
    // **Edges (Wireframe) should be created after geometry is set up**
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: "white" });
    wireframe = new THREE.LineSegments(edges, lineMaterial);
    scene.add(wireframe);
  }
  

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();  // Smooth controls
  renderer.render(scene, camera);
}
animate();

// Handle window resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


//I added this for the button functionality
document.getElementById("toggleWireframeButton").addEventListener("click", () => {
  console.log("The button was clicked");
  if(mesh.visible){
    mesh.visible = false;
    wireframe.material.color.set("white");
    document.getElementById("toggleWireframeButton").innerText = "Faces: Off";
  } else {
    mesh.visible = true;
    wireframe.material.color.set("white");
    document.getElementById("toggleWireframeButton").innerText = "Faces: On"
  }
});


document.getElementById("showEdges").addEventListener("click", () => {
  if(wireframe.visible){
    wireframe.visible = false;
    document.getElementById("showEdges").innerText = "Edges: Off"
  } else {
    wireframe.visible = true;
    document.getElementById("showEdges").innerText = "Edges: On"
  }
});