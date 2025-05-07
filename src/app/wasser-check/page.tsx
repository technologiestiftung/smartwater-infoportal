"use client";

import { Suspense } from "react";
import FloodCheckClient from "./FloodCheckClient";

export default function FloodCHeck() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<FloodCheckClient />
		</Suspense>
	);
}
