import React, { useEffect, useRef, useState } from "react";
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

  const [modelLoaded, setModelLoaded] = useState(false);
  const [faceColor, setFaceColor] = useState("#8B0000");
  const [edgeColor, setEdgeColor] = useState("#ffffff");
  const [facesVisible, setFacesVisible] = useState(true);
  const [edgesVisible, setEdgesVisible] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });

    console.log(
      "Mount size:",
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );

    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);
    console.log("Canvas mounted?", renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 1));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.03;

    // Load model
    fetch("/models/example.json")
      .then((res) => res.json())
      .then((data) => {
        console.log("Model file loaded.");
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
        scene.add(mesh);

        // Wireframe
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: edgeColor });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        wireframeRef.current = wireframe;
        scene.add(wireframe);

        const box = new THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new THREE.Vector3());
        mesh.position.sub(center); // center the model
        wireframe.position.sub(center);

        const size = box.getSize(new THREE.Vector3()).length();
        const distance = size * 1.5;
        camera.position.set(0, 0, distance);
        controls.target.set(0, 0, 0);
        controls.update();

        console.log("Model rendered.");

        // ✅ Notify React that model is ready
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

    // Resize
    const handleResize = () => {
      camera.aspect =
        mountRef.current!.clientWidth / mountRef.current!.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current!.clientWidth,
        mountRef.current!.clientHeight
      );
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

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

  // Update mesh color when faceColor changes
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material.color.set(faceColor);
    }
  }, [faceColor]);

  // Update wireframe color when edgeColor changes
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
      />
    </div>
  );
};

export default MainViewer;
