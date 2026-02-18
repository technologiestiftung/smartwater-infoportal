import ScenarioMap from "@/components/ScenarioMap/Map";
import { Scenario } from "@/types/map";

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
			className="h-[700px] w-[1140px] overflow-hidden bg-white"
		>
			<ScenarioMap scenario={scenario as Scenario} />
		</div>
	);
}
