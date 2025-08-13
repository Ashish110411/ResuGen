import React, { useState } from 'react';
import { FileText, Plus, Trash2, ChevronDown, CirclePlus } from 'lucide-react';
import '../styles/custom-section.css';

const CustomSection = ({
                           data,
                           updateData,
                           removeSection
                       }) => {
    const [open, setOpen] = useState(true);

    // Add a new point
    const addPoint = () => {
        updateData({ ...data, points: [...(data.points || []), ''] });
    };

    // Remove a point by index
    const removePoint = (idx) => {
        const newPoints = [...(data.points || [])];
        newPoints.splice(idx, 1);
        updateData({ ...data, points: newPoints });
    };

    // Update a point's content
    const updatePoint = (idx, value) => {
        const newPoints = [...(data.points || [])];
        newPoints[idx] = value;
        updateData({ ...data, points: newPoints });
    };

    // Update section name
    const handleNameChange = (e) => {
        updateData({ ...data, name: e.target.value });
    };

    return (
        <div className="custom-section">
            <div className="section-header">
                <div className="section-title">
                    <CirclePlus className="section-icon" size={24} />
                    <input
                        type="text"
                        className="custom-section-name"
                        placeholder="Section Name"
                        value={data.name}
                        onChange={handleNameChange}
                    />
                </div>
                <div className="section-controls">
                    <button
                        className="section-toggle-btn"
                        onClick={() => setOpen(o => !o)}
                        title={open ? "Collapse section" : "Expand section"}
                        aria-label={open ? "Collapse section" : "Expand section"}
                        type="button"
                    >
                        {open
                            ? <ChevronDown size={24} className="chevron-expanded" />
                            : <ChevronDown size={24} />
                        }
                    </button>
                    <button
                        className="btn-primary add-btn"
                        onClick={addPoint}
                        type="button"
                    >
                        <Plus size={16} />
                        Add Point
                    </button>
                    <button
                        className="btn-tertiary remove-section-btn"
                        onClick={removeSection}
                        title="Remove Section"
                        type="button"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {open && (
                <div className="custom-list">
                    {(data.points || []).map((pt, idx) => (
                        <div key={idx} className="custom-item">
                            {(data.points.length > 1) && (
                                <div className="item-header">
                                    <span className="item-number">#{idx + 1}</span>
                                    <button
                                        onClick={() => removePoint(idx)}
                                        className="remove-btn"
                                        title="Remove Point"
                                        type="button"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )}
                            <div className="custom-content">
                                <div className="input-group">
                                    <div className="input-wrapper">
                                        <FileText size={16} className="input-icon" />
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Describe achievement, responsibility, or point"
                                            value={pt}
                                            onChange={e => updatePoint(idx, e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSection;