import { useEffect, useState } from "react";

// Define your mobile breakpoint (e.g., 768px)
const MOBILE_BREAKPOINT = 768;

const useMobile = () => {
	const [isMobile, setIsMobile] = useState<boolean>(false);

	useEffect(() => {
		// Handler that sets isMobile based on window width
		const handleResize = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};

		// Run on first load
		handleResize();

		// Listen for window resize
		window.addEventListener("resize", handleResize);

		// Cleanup on unmount
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return isMobile;
};

export default useMobile;
