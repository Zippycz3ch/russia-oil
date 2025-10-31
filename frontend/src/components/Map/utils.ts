// Function to interpolate points between border points for smoother curves
export const interpolateBorder = (borderLine: [number, number][], pointsPerSegment: number = 3): [number, number][] => {
    const interpolated: [number, number][] = [];

    for (let i = 0; i < borderLine.length - 1; i++) {
        const current = borderLine[i];
        const next = borderLine[i + 1];

        for (let j = 0; j < pointsPerSegment; j++) {
            const t = j / pointsPerSegment;
            interpolated.push([
                current[0] + (next[0] - current[0]) * t,
                current[1] + (next[1] - current[1]) * t
            ]);
        }
    }

    return interpolated;
};

// Function to create rounded offset boundary around all of Ukraine
export const createOffsetLine = (borderLine: [number, number][], distanceKm: number): [number, number][] => {
    // First interpolate more points for smoother boundary
    const smoothBorder = interpolateBorder(borderLine, 5);

    // Create offset points radially outward from Ukraine's center
    // At this latitude, 1 degree longitude ≈ 70km, 1 degree latitude ≈ 111km
    const latPerKm = 1 / 111;
    const lonPerKm = 1 / 70;

    const centerLat = 48.5;  // Approximate center of Ukraine
    const centerLon = 31.5;

    const offsetPoints: [number, number][] = [];

    for (let i = 0; i < smoothBorder.length; i++) {
        const point = smoothBorder[i];

        // Calculate direction from center to this border point (radial outward)
        const toLat = point[0] - centerLat;
        const toLon = point[1] - centerLon;
        const distance = Math.sqrt(toLat * toLat + toLon * toLon);

        if (distance === 0) continue;

        // Normalize direction and scale by desired distance
        const dirLat = toLat / distance;
        const dirLon = toLon / distance;

        // Calculate angle from center (0° = north, 90° = east, 180° = south, 270° = west)
        const angle = Math.atan2(toLon, toLat) * (180 / Math.PI);

        // Smooth reduction for east (45° to 135°) and south (135° to 225°)
        let reduction = 0;

        // East-northeast reduction: gradually from 0 at 45° to max 100km at 67.5° back to 0 at 90°
        if (angle >= 45 && angle <= 90) {
            const eneFactor = 1 - Math.abs((angle - 67.5) / 22.5);
            reduction += 100 * eneFactor;
        }

        // East reduction: gradually from 0 at 45° to max 300km at 90° back to 0 at 135°
        if (angle >= 45 && angle <= 135) {
            const eastFactor = 1 - Math.abs((angle - 90) / 45);
            reduction += 300 * eastFactor;
        }

        // South reduction: gradually from 0 at 135° to max 300km at 180° back to 0 at 225°
        if (Math.abs(angle) >= 135) {
            const southAngle = Math.abs(angle);
            const southFactor = 1 - Math.abs((southAngle - 180) / 45);
            reduction += 300 * southFactor;
        }

        // Southeast reduction: gradually from 0 at 90° to max 300km at 135° back to 0 at 180°
        if (angle >= 90 && angle <= 180) {
            const southeastFactor = 1 - Math.abs((angle - 135) / 45);
            reduction += 300 * southeastFactor;
        }

        const adjustedDistance = Math.max(0, distanceKm - reduction);

        offsetPoints.push([
            point[0] + dirLat * adjustedDistance * latPerKm,
            point[1] + dirLon * adjustedDistance * lonPerKm
        ]);
    }

    return offsetPoints;
};
