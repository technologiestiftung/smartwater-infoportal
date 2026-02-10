import { HazardEntity } from "@/utils/storeUtils";
import ResultBlock from "@/components/ResultBlock";

export const dynamic = "force-dynamic";

export default async function WidgetScreenshotPage({
	searchParams,
}: {
	searchParams: Promise<HazardEntity>;
}) {
	const { name, hazardLevel, showSubLabel, subHazardLevel } =
		await searchParams;

	if (!name) {
		return (
			<div className="p-8">
				<h1>Bitte wählen Sie einen Typ Widget aus.</h1>
			</div>
		);
	}

	return (
		<div className="w-[400px]">
			<ResultBlock
				key={name}
				entity={name}
				hazardLevel={hazardLevel}
				showSubLabel={showSubLabel || false}
				subHazardLevel={subHazardLevel}
			/>
		</div>
	);
}
