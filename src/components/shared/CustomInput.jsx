// TextInput.jsx
import React from 'react';
import './css/CustomInput.css'

const CustomnInput = ({ label, id, type = 'text', value, onChange, placeholder }) => {
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <input
        type={type}
        className="form-control"
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};

export default CustomnInput;
