import L from 'leaflet';

export const getMarkerColor = (type: string): string => {
    // Normalize type to lowercase for comparison
    const normalizedType = type?.toLowerCase().trim();
    switch (normalizedType) {
        case 'refinery': return '#1cc5b7ff';
        case 'extraction': return '#8B5CF6';
        case 'storage': return '#F59E0B';
        default:
            return '#FFC300';
    }
};

export const createCustomIcon = (color: string, damagePercentage: number = 0) => {
    let borderColor = 'white'; // White for operational
    let borderWidth = 2;

    if (damagePercentage >= 80) {
        borderColor = '#000000'; // Black for 80-100%
        borderWidth = 3;
    } else if (damagePercentage >= 40) {
        borderColor = '#DC2626'; // Red for 40-79%
        borderWidth = 3;
    } else if (damagePercentage > 0) {
        borderColor = '#F59E0B'; // Orange for 1-39%
        borderWidth = 3;
    }

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: ${borderWidth}px solid ${borderColor}; box-sizing: border-box;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });
};

export const createCapitalIcon = (capital: { name: string; color?: string; colors?: { top: string; bottom: string } }) => {
    if (capital.name === "Moscow" && capital.color) {
        // 5-point star for Moscow
        return L.divIcon({
            className: 'capital-marker',
            html: `<div style="
                width: 24px; 
                height: 24px; 
                display: flex;
                align-items: center;
                justify-content: center;
                filter: drop-shadow(0 0 4px rgba(0,0,0,0.7));
            ">
                <svg width="24" height="24" viewBox="0 0 24 24" style="display: block;">
                    <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z" 
                          fill="${capital.color}" 
                          stroke="white" 
                          stroke-width="2"/>
                </svg>
            </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    } else if (capital.name === "Kyiv" && capital.colors) {
        // 5-point star with Ukrainian flag colors (horizontal 70/30 split - blue 70%, yellow 30%)
        return L.divIcon({
            className: 'capital-marker',
            html: `<div style="
                width: 24px; 
                height: 24px; 
                display: flex;
                align-items: center;
                justify-content: center;
                filter: drop-shadow(0 0 4px rgba(0,0,0,0.7));
            ">
                <svg width="24" height="24" viewBox="0 0 24 24" style="display: block;">
                    <defs>
                        <linearGradient id="ukraineFlag" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="70%" style="stop-color:${capital.colors.top};stop-opacity:1" />
                            <stop offset="70%" style="stop-color:${capital.colors.bottom};stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <path d="M12 2 L15.09 8.26 L22 9.27 L17 14.14 L18.18 21.02 L12 17.77 L5.82 21.02 L7 14.14 L2 9.27 L8.91 8.26 Z" 
                          fill="url(#ukraineFlag)"/>
                </svg>
            </div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    }

    return L.divIcon({
        className: 'capital-marker',
        html: '<div></div>',
        iconSize: [0, 0]
    });
};
