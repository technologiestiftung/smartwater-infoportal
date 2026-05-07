import { useTranslations } from "next-intl";
import { FloodRiskAnswers } from "@/lib/types";
import { HazardEntity } from "@/utils/storeUtils";
import { cn } from "@/lib/utils";
import { getDefaultRiskFactors } from "./Report/utils";
import Image from "next/image";

interface RiskFactorsProps {
	floodRiskAnswers: FloodRiskAnswers | null;
	hazardEntities: HazardEntity[] | null;
	isNotRiskBlock?: boolean;
}

const RiskFactors = ({
	hazardEntities,
	floodRiskAnswers,
	isNotRiskBlock = false,
}: RiskFactorsProps) => {
	const t = useTranslations("floodCheck");

	if (!floodRiskAnswers) {
		return null;
	}

	const defaultRiskFactors = getDefaultRiskFactors(
		floodRiskAnswers,
		hazardEntities ?? [],
		t,
	);

	return (
		<>
			{defaultRiskFactors.map((factor) => {
				return (
					<div key={factor.id} className="inline-flex gap-4">
						<Image
							src={factor.tag}
							alt=""
							width={0}
							height={0}
							className="size-5"
						/>
						<div className="flex flex-col gap-1">
							<span aria-hidden className={cn(isNotRiskBlock && "font-bold")}>
								{factor.name}
							</span>
							{isNotRiskBlock && (
								<>
									<span aria-hidden>{factor.description}</span>{" "}
									{!!factor.hasInfo && (
										<span className="italic">
											{t(factor.translationKey.replace("title", "info"))}
										</span>
									)}
								</>
							)}
						</div>
					</div>
				);
			})}
		</>
	);
};

export default RiskFactors;
