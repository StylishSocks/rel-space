import React, { useEffect, useRef, useState } from "react";
import { ENDPOINTS } from "../utils/api";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import ViewerControls from "./ViewerControls";

const MainViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<THREE.Mesh<
    THREE.BufferGeometry,
    THREE.MeshStandardMaterial
  > | null>(null);
  const wireframeRef = useRef<THREE.LineSegments<
    THREE.BufferGeometry,
    THREE.LineBasicMaterial
  > | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const initialCameraPos = useRef(new THREE.Vector3());
  const initialControlsTarget = useRef(new THREE.Vector3());

  const [modelLoaded, setModelLoaded] = useState(false);
  const [faceColor, setFaceColor] = useState("#8B0000");
  const [edgeColor, setEdgeColor] = useState("#ffffff");
  const [facesVisible, setFacesVisible] = useState(true);
  const [edgesVisible, setEdgesVisible] = useState(true);
  const [showAxes, setShowAxes] = useState(false);

  const handleResetView = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.copy(initialCameraPos.current);
      controlsRef.current.target.copy(initialControlsTarget.current);
      controlsRef.current.update();
    }
  };

  const handleToggleAxes = () => {
    setShowAxes((v) => !v);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Capture container dimensions safely
    const container = mountRef.current!;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    cameraRef.current = camera;
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x202020);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.03;
    controlsRef.current = controls;

    // Load model
    //fetch("models/example2.json")
    fetch(ENDPOINTS.parsed_model)
      .then((res) => res.json())
      .then((data) => {
        // Geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(data.vertices.flat()), 3)
        );
        geometry.setIndex(
          new THREE.BufferAttribute(new Uint16Array(data.faces.flat()), 1)
        );
        geometry.computeVertexNormals();

        // Mesh
        const material = new THREE.MeshStandardMaterial({
          color: faceColor,
          metalness: 0.3,
          roughness: 0.7,
        });
        const mesh = new THREE.Mesh(geometry, material);
        meshRef.current = mesh;
        mesh.frustumCulled = false;
        scene.add(mesh);

        // Wireframe
        const edgesGeo = new THREE.EdgesGeometry(geometry);
        const lineMat = new THREE.LineBasicMaterial({ color: edgeColor });
        const wireframe = new THREE.LineSegments(edgesGeo, lineMat);
        wireframeRef.current = wireframe;
        wireframe.frustumCulled = false;
        scene.add(wireframe);

        // Center model
        const box = new THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new THREE.Vector3());
        mesh.position.sub(center);
        wireframe.position.sub(center);

        // Compute camera framing
        const sphere = box.getBoundingSphere(new THREE.Sphere());
        const fovVert = camera.fov * (Math.PI / 180);
        const aspectRatio = width / height;
        const fovHorz = 2 * Math.atan(Math.tan(fovVert / 2) * aspectRatio);
        const distVert = sphere.radius / Math.tan(fovVert / 2);
        const distHorz = sphere.radius / Math.tan(fovHorz / 2);
        const distance = Math.max(distVert, distHorz) * 1.2;

        camera.position.set(distance, distance, distance);
        camera.up.set(0, 1, 0);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();

        // Store initial view for reset
        initialCameraPos.current.copy(camera.position);
        initialControlsTarget.current.copy(controls.target);

        // Axes helper
        const axes = new THREE.AxesHelper(
          box.getSize(new THREE.Vector3()).length()
        );
        axes.visible = showAxes;
        axesHelperRef.current = axes;
        scene.add(axes);

        setModelLoaded(true);
      });

    // Animate
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement))
        container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Toggle axes visibility
  useEffect(() => {
    if (axesHelperRef.current) {
      axesHelperRef.current.visible = showAxes;
    }
  }, [showAxes]);

  // Existing feature toggles
  useEffect(() => {
    if (modelLoaded && meshRef.current) {
      meshRef.current.visible = facesVisible;
    }
  }, [facesVisible, modelLoaded]);

  useEffect(() => {
    if (modelLoaded && wireframeRef.current) {
      wireframeRef.current.visible = edgesVisible;
    }
  }, [edgesVisible, modelLoaded]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material.color.set(faceColor);
    }
  }, [faceColor]);

  useEffect(() => {
    if (wireframeRef.current) {
      wireframeRef.current.material.color.set(edgeColor);
    }
  }, [edgeColor]);

  return (
    <div className="app-container">
      <div ref={mountRef} className="three-canvas" />
      <ViewerControls
        facesVisible={facesVisible}
        edgesVisible={edgesVisible}
        faceColor={faceColor}
        edgeColor={edgeColor}
        onToggleFaces={() => setFacesVisible((prev) => !prev)}
        onToggleEdges={() => setEdgesVisible((prev) => !prev)}
        onFaceColorChange={setFaceColor}
        onEdgeColorChange={setEdgeColor}
        onResetView={handleResetView}
        onToggleAxes={handleToggleAxes}
        axesVisible={showAxes}
      />
    </div>
  );
};

export default MainViewer;
