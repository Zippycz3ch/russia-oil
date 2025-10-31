import React from 'react';

interface LegendIconProps {
    color: string;
    damagePercentage?: number;
}

export const LegendIcon: React.FC<LegendIconProps> = ({ color, damagePercentage = 0 }) => {
    let borderColor = 'white';
    let borderWidth = 2;

    if (damagePercentage >= 80) {
        borderColor = '#000000';
        borderWidth = 3;
    } else if (damagePercentage >= 40) {
        borderColor = '#DC2626';
        borderWidth = 3;
    } else if (damagePercentage > 0) {
        borderColor = '#F59E0B';
        borderWidth = 3;
    }

    return (
        <span style={{ 
            display: 'inline-block',
            width: '12px', 
            height: '12px', 
            backgroundColor: color,
            borderRadius: '50%',
            border: `${borderWidth}px solid ${borderColor}`,
            boxSizing: 'border-box'
        }}></span>
    );
};
