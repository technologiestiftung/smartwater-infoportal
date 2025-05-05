"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function useHash() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [hash, setHash] = useState<string>("");

	useEffect(() => {
		const fromLocation = () => window.location.hash.replace(/^#/, "");
		setHash(fromLocation());

		const onHash = () => setHash(fromLocation());
		window.addEventListener("hashchange", onHash);
		return () => window.removeEventListener("hashchange", onHash);
	}, [pathname, searchParams]);

	return hash;
}
