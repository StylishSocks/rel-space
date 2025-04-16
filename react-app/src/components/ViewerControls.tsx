import React from "react";

interface ViewerControlsProps {
  facesVisible: boolean;
  edgesVisible: boolean;
  faceColor: string;
  edgeColor: string;
  onToggleFaces: () => void;
  onToggleEdges: () => void;
  onFaceColorChange: (color: string) => void;
  onEdgeColorChange: (color: string) => void;
}

const ViewerControls: React.FC<ViewerControlsProps> = ({
  facesVisible,
  edgesVisible,
  faceColor,
  edgeColor,
  onToggleFaces,
  onToggleEdges,
  onFaceColorChange,
  onEdgeColorChange,
}) => {
  return (
    <div className="toolbar">
      <button onClick={onToggleFaces}>
        Faces: {facesVisible ? "On" : "Off"}
      </button>
      <button onClick={onToggleEdges}>
        Edges: {edgesVisible ? "On" : "Off"}
      </button>

      <label>
        <span>Face</span>
        <input
          type="color"
          value={faceColor}
          onChange={(e) => onFaceColorChange(e.target.value)}
        />
      </label>

      <label>
        <span>Edge</span>
        <input
          type="color"
          value={edgeColor}
          onChange={(e) => onEdgeColorChange(e.target.value)}
        />
      </label>
    </div>
  );
};

export default ViewerControls;
