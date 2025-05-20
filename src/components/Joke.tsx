// ❌ Remove any 'use client' directive at the top of the file
"use client";

import { getJoke } from "@/server/actions/getJoke";
import { useEffect, useState } from "react";

export default function Joke() {
	const [joke, setJoke] = useState<{ setup: string; punchline: string }>({
		setup: "",
		punchline: "",
	});

	useEffect(() => {
		const requestJoke = async () => {
			const generateJoke = await getJoke();
			setJoke(generateJoke.data);
		};
		requestJoke();
	}, []);

	return (
		<div className="flex flex-grow justify-center">
			<div className="mx-auto flex flex-grow flex-col py-5 lg:max-w-[61.25rem]">
				<h2>Witz:</h2>
				<h1 className="text-indigo-800">{joke?.setup}</h1>
				<h1 className="text-indigo-800">{joke?.punchline}</h1>
			</div>
		</div>
	);
}
