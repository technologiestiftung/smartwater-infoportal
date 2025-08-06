import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";

const styles = {
	Point: new Style({
		image: new CircleStyle({
			radius: 6,
			fill: new Fill({
				color: "#d5230d", // Rot für Punkte
			}),
			stroke: new Stroke({
				color: "#d5230d",
				width: 1,
			}),
		}),
	}),
	Polygon: new Style({
		stroke: new Stroke({
			color: "#d5230d", // Rot für Umrisse
			width: 2,
		}),
		fill: new Fill({
			color: "rgba(213, 35, 13, 0.3)", // Halbtransparentes Rot für Flächen
		}),
	}),
	MultiPolygon: new Style({
		stroke: new Stroke({
			color: "#d5230d", // Rot für Umrisse
			width: 2,
		}),
		fill: new Fill({
			color: "rgba(213, 35, 13, 0.3)", // Halbtransparentes Rot
		}),
	}),
};

export default styles;
