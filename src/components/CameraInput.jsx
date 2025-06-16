// import React from 'react';
// import styled from 'styled-components';

// const Input = styled.input`
//   margin: 1rem 0;
//   width: 100%;
// `;

// export default function CameraInput({ onCapture }) {
//   return (
//     <Input
//       type="file"
//       accept="image/*"
//       capture="environment"
//       onChange={(e) => onCapture(e.target.files[0])}
//     />
//   );
// }
import React, { useRef, useEffect } from "react";
import styled from "styled-components";

const Input = styled.input`
  margin: 1rem 0;
  width: 100%;
  height: 60px;
  font-size: 1rem;
  padding: 0.5rem;
  border: 2px solid #ccc;
  border-radius: 8px;
  background: #f9f9f9;

  &::file-selector-button {
    font-size: 1rem;
    padding: 0.5rem 1rem;
    border: none;
    background-color: #0070f3;
    color: white;
    border-radius: 6px;
    cursor: pointer;
  }

  &:hover::file-selector-button {
    background-color: #005bb5;
  }
`;

export default function CameraInput({ onCapture, resetTrigger }) {
  const inputRef = useRef();

  // Reset the file input when resetTrigger changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [resetTrigger]);

  return (
    <Input
      ref={inputRef}
      type="file"
      accept="image/*"
      capture="environment"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onCapture(file);
      }}
    />
  );
}
