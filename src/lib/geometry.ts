/**
 * MapFish scale denominator from extent + print map size.
 *
 * widthMm / heightMm = actual map frame size on paper in millimeters
 * paddingFactor = extra margin around the geometry, e.g. 1.1 = 10% padding
 */
export function getMapfishCenterAndScale(geometry: GeoJSON.Geometry): {
	center: [number, number];
	scale: number;
} {
	const coords =
		geometry.type === "MultiPolygon"
			? geometry.coordinates.flat(2)
			: geometry.type === "Polygon"
				? geometry.coordinates.flat(1)
				: geometry.type === "LineString"
					? geometry.coordinates
					: geometry.type === "Point"
						? [geometry.coordinates]
						: [];

	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	for (const [x, y] of coords) {
		if (x < minX) minX = x;
		if (y < minY) minY = y;
		if (x > maxX) maxX = x;
		if (y > maxY) maxY = y;
	}

	const center: [number, number] = [(minX + maxX) / 2, (minY + maxY) / 2];

	let width = maxX - minX;
	let height = maxY - minY;

	// avoid over-zoom
	const minSizeMeters = 40;
	if (width < minSizeMeters) width = minSizeMeters;
	if (height < minSizeMeters) height = minSizeMeters;

	// padding
	const paddingFactor = 1.2;
	width *= paddingFactor;
	height *= paddingFactor;

	// ✅ static A4 landscape (converted from px)
	const widthMm = 297;
	const heightMm = 210;

	const scaleFromWidth = width / (widthMm / 1000);
	const scaleFromHeight = height / (heightMm / 1000);

	const scale = Math.max(scaleFromWidth, scaleFromHeight) * 1.2;

	return {
		center,
		scale: Math.ceil(scale),
	};
}
