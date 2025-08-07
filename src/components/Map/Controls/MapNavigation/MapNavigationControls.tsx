"use client";

import ZoomControl from "./ZoomControl";

const MapNavigationControls = () => {
	return (
		<div className="absolute right-4 top-4 z-[2] flex flex-col gap-2">
			<div className="relative">
				<ZoomControl />
			</div>
		</div>
	);
};
export default MapNavigationControls;
