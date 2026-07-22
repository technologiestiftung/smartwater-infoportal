import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMaximize, faMinimize } from "@fortawesome/free-solid-svg-icons";
import useStore from "@/store/defaultStore";

const FullScreenControl = () => {
	const {
		interactiveMap: { fullScreenMap },
		updateInteractiveMap,
	} = useStore();

	return (
		<button
			type="button"
			className="inline-flex h-[44px] w-[44px] cursor-pointer items-center justify-center border border-black bg-white"
			onClick={() => updateInteractiveMap({ fullScreenMap: !fullScreenMap })}
			aria-label={
				fullScreenMap ? "Kartenansicht verkleinern" : "Kartenansicht vergrößern"
			}
		>
			<FontAwesomeIcon
				icon={fullScreenMap ? faMinimize : faMaximize}
				className="text-[18px] text-black"
			/>
		</button>
	);
};

export default FullScreenControl;
