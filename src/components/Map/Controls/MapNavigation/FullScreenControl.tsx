import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMaximize, faMinimize } from "@fortawesome/free-solid-svg-icons";
import useStore from "@/store/defaultStore";

const FullScreenControl = () => {
	const fullScreenMap = useStore((state) => state.fullScreenMap);
	const updateFullScreenMap = useStore((state) => state.updateFullScreenMap);

	return (
		<div
			className="inline-flex h-[44px] w-[44px] cursor-pointer items-center justify-center border-2 border-black bg-white"
			onClick={() => updateFullScreenMap(!fullScreenMap)}
		>
			<FontAwesomeIcon
				icon={fullScreenMap ? faMinimize : faMaximize}
				className="text-[18px] text-black"
			/>
		</div>
	);
};

export default FullScreenControl;
