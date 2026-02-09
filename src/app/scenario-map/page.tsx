import ScenarioMap from "@/components/ScenarioMap/Map";
import { Scenario } from "@/types/map";

// IMPORTANT: ensure this page can render without client-only assumptions
export const dynamic = "force-dynamic";

export default async function ScenarioMapPage({
	searchParams,
}: {
	searchParams: Promise<{ scenario?: string }>;
}) {
	const { scenario } = await searchParams;

	if (!scenario) {
		return (
			<div className="p-8">
				<h1>Bitte wählen Sie ein Szenario aus.</h1>
			</div>
		);
	}

	return (
		<div
			id="scenario-maps"
			data-scenario={scenario}
			style={{
				background: "white",
				width: 1140,
				height: 700,
				overflow: "hidden",
			}}
		>
			<ScenarioMap scenario={scenario as Scenario} />
		</div>
	);
}
