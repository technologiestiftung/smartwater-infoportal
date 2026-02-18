import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import useStore from "@/store/defaultStore";

const LayerTreeControl = () => {
	const {
		interactiveMap: { isLayerTreeOpen },
		updateInteractiveMap,
	} = useStore();

	return (
		<div
			className={`inline-flex h-[44px] w-[44px] cursor-pointer items-center justify-center border border-black ${isLayerTreeOpen ? "bg-red" : "bg-white"}`}
			onClick={() =>
				updateInteractiveMap({ isLayerTreeOpen: !isLayerTreeOpen })
			}
		>
			<FontAwesomeIcon
				icon={faLayerGroup}
				className={`text-[18px] ${isLayerTreeOpen ? "text-white" : "text-black"}`}
			/>
		</div>
	);
};

export default LayerTreeControl;
