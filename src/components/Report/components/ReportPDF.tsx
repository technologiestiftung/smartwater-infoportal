/* eslint-disable */
"use client";

import { useTranslations } from "next-intl";
import { FC, useEffect, useRef, useState } from "react";
import { Button, DownloadItem, Spinner } from "berlin-ui-library";
import useStore from "@/store/defaultStore";
import useMobile from "@/lib/utils/useMobile";
import {
	translateHazardLevels,
	getToday,
	translateHazardTags,
	getScreenshotForScenario,
} from "../utils";
import pdfData from "@/components/Report/pdf.json";
import { drawPDF } from "../pdf";
import { PDFKeys, PDFProps } from "../types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import getWMSForBuildingAndStartPDFImageFetch from "@/app/hochwasser-check/utils";

interface ReportPDFProps {
	skip: string | null;
}

const ReportPDF: FC<ReportPDFProps> = ({ skip }) => {
	const t = useTranslations();
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const makePDFInitializedRef = useRef<boolean>(false);
	const pdfUrlRef = useRef<string | null>(null);
	const {
		currentUserAddress,
		getHazardEntities,
		locationData,
		floodRiskAnswers,
		floodRiskResult,
		pdfKeys,
		numberOfFetchedPDFImages,
		numberOfPDFImagesToFetch,
		pdfError,
		setPDFError,
		setPDFKeys,
		addToNumberOfFetchedPDFImages,
		clearPDFKeys,
	} = useStore();
	const hazardEntities = getHazardEntities();
	const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
	const [pdfSizeKB, setPdfSizeKB] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [done, setDone] = useState<string[]>([]);
	const isMobile = useMobile();
	const addToImages = !skip ? 3 : 2;
	const openPDFInNewTab = true;

	const checks = [
		{
			id: "wms",
			text: "Alle Daten errechnet",
			loading: "Daten werden errechnet...",
		},
		{
			id: "images",
			loading: "Warten auf Bilder...",
		},
		{
			id: "pdf",
			text: "PDF erstellt",
			loading: "PDF wird erstellt...",
		},
	];

	const addToPDFKeys: PDFKeys = {
		"{date}": getToday(),
		"{address}": currentUserAddress?.name || "Keine Adresse gefunden",
		"{hazardLevelHeavyRain}": hazardEntities
			? translateHazardLevels(hazardEntities[0].hazardLevel)
			: "Keine Daten",
		"{hazardLevelfloodRisk}": hazardEntities
			? translateHazardLevels(hazardEntities[1].hazardLevel)
			: "Keine Daten",
		"{skip}": !!skip,
		"{isOwner}":
			!!skip ||
			(typeof floodRiskAnswers?.q0?.value === "string" &&
				floodRiskAnswers?.q0?.value?.includes("Owner")),
		"{basementHazardTag}": translateHazardTags(
			floodRiskAnswers?.q1?.value as string,
			"q1",
		),
		"{highBasementHazard}": floodRiskAnswers?.q1?.value === "yesWithWindow",
		"{midBasementHazard}": floodRiskAnswers?.q1?.value === "yesWithoutWindow",
		"{lowBasementHazard}": floodRiskAnswers?.q1?.value === "no",
		"{dontKnowBasementHazard}": floodRiskAnswers?.q1?.value === "noInformation",
		"{basementUsageTag}": translateHazardTags(
			floodRiskAnswers?.q2?.value as string,
			"q2",
		),
		"{noBasementUsageHazard}": !floodRiskAnswers?.q2,
		"{highBasementUsageHazard}": floodRiskAnswers?.q2?.value === "highValue",
		"{midBasementUsageHazard}": floodRiskAnswers?.q2?.value === "lowValue",
		"{backflowPreventionTag}": translateHazardTags(
			floodRiskAnswers?.q3?.value as string,
			"q3",
		),
		"{highBackflowPrevention}":
			floodRiskAnswers?.q3?.value === "no" ||
			floodRiskAnswers?.q3?.value === "noInformation",
		"{midBackflowPrevention}": floodRiskAnswers?.q3?.value === "yesUnknown",
		"{lowBackflowPrevention}": floodRiskAnswers?.q3?.value === "yesGood",
		"{dontKnowBackflowPrevention}": floodRiskAnswers?.q3?.value === "dontKnow",
		"{propertyDrainageTag}": translateHazardTags(
			floodRiskAnswers?.q4?.value as string,
			"q4",
		),
		"{noPropertyDrainageHazard}":
			floodRiskAnswers?.q4?.value === "noInformation",
		"{highPropertyDrainageHazard}": floodRiskAnswers?.q4?.value === "bad",
		"{lowPropertyDrainageHazard}": floodRiskAnswers?.q4?.value === "good",
		"{pastDamagesTag}": translateHazardTags(
			floodRiskAnswers?.q5?.value as string,
			"q5",
		),
		"{noPastDamages}": floodRiskAnswers?.q5?.value === "noInformation",
		"{highPastDamages}": floodRiskAnswers?.q5?.value === "yes",
		"{lowPastDamages}": floodRiskAnswers?.q5?.value === "no",
		"{floodZoneTag}": translateHazardTags(
			floodRiskAnswers?.qA?.value as string,
			"qA",
		),
		"{highFloodZone}": floodRiskAnswers?.qA?.value === "yes",
		"{lowFloodZone}": floodRiskAnswers?.qA?.value === "no",
		"{fluvialFloodTag}": translateHazardTags(
			floodRiskAnswers?.qB?.value as string,
			"qB",
		),
		"{highFluvialFlood}":
			typeof floodRiskAnswers?.qB?.value === "number" &&
			floodRiskAnswers?.qB?.value > 1,
		"{midFluvialFlood}":
			typeof floodRiskAnswers?.qB?.value === "number" &&
			floodRiskAnswers?.qB?.value === 1,
		"{lowFluvialFlood}":
			typeof floodRiskAnswers?.qB?.value === "number" &&
			floodRiskAnswers?.qB?.value === 0,
		"{heavyRainTag}": translateHazardTags(
			floodRiskAnswers?.qC?.value as string,
			"qC",
		),
		"{highHeavyRain}":
			typeof floodRiskAnswers?.qC?.value === "number" &&
			floodRiskAnswers?.qC?.value > 1,
		"{midHeavyRain}":
			typeof floodRiskAnswers?.qC?.value === "number" &&
			floodRiskAnswers?.qC?.value === 1,
		"{lowHeavyRain}":
			typeof floodRiskAnswers?.qC?.value === "number" &&
			floodRiskAnswers?.qC?.value === 0,
		"{basementWithWindows}": floodRiskAnswers?.q1?.value === "yesWithWindow",
		"{basementWithoutWindows}":
			floodRiskAnswers?.q1?.value === "yesWithoutWindow",
	};

	const makePDF = async () => {
		if (!locationData?.found || !locationData.building) {
			return setError(
				"Es wurden leider keine Gebäudedaten gefunden. Also kann das PDF nicht erstellt werden.",
			);
		}

		if (error) {
			setError(null);
		}

		// add PDFKeys from Questionnaire
		Object.assign(addToPDFKeys, pdfKeys);

		const scenarios = ["heavyRainWidget", "fluvialFloodWidget"];

		if (!skip) {
			scenarios.push("risk-block");
		}

		try {
			for (const scenario of scenarios) {
				const { key, blob } = await getScreenshotForScenario(
					scenario,
					locationData,
					hazardEntities,
					floodRiskResult,
					floodRiskAnswers,
				);
				addToNumberOfFetchedPDFImages(undefined);
				addToPDFKeys[`#${key}`] = blob;
			}
		} catch (captureError) {
			return setError("Error capturing screenshots: " + captureError);
		}

		setDone((prev) => [...prev, "images"]);

		// Draw PDF
		try {
			const pdfBlobCreated = await drawPDF(pdfData as PDFProps, addToPDFKeys);
			if (!pdfBlobCreated?.blob) {
				throw new Error("Failed to create PDF blob.");
			}
			setDone((prev) => [...prev, "pdf"]);
			await new Promise((r) => setTimeout(r, 1500));
			setPdfSizeKB(pdfBlobCreated.sizeInMB);
			setPdfBlob(pdfBlobCreated?.blob);
		} catch (catchError) {
			setError("Error creating PDF: " + catchError);
		}
		makePDFInitializedRef.current = false;
	};

	const checkWMSLoaded = () => {
		const checkWMSLoaded = pdfKeys["wmsDataLoaded"];
		if (checkWMSLoaded) {
			setDone((prev) => [...prev, "wms"]);
		}
	};

	const checkMakePDF = () => {
		const checkFirstFetchCompleted = pdfKeys["{finishedFirstFetch}"];
		if (makePDFInitializedRef.current || !checkFirstFetchCompleted) {
			return;
		}
		makePDFInitializedRef.current = true;
		makePDF();
	};

	useEffect(() => {
		checkMakePDF();
		checkWMSLoaded();
	}, [pdfKeys]);

	useEffect(() => {
		if (!!pdfError) {
			setError(pdfError);
		}
	}, [pdfError]);

	useEffect(() => {
		const wrapper = wrapperRef.current;
		if (!wrapper || !pdfBlob) {
			return () => {};
		}

		const handleClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const clickedButton = target.closest("button");

			if (clickedButton && wrapper.contains(clickedButton)) {
				const url = pdfUrlRef.current;
				if (!url) {
					return;
				}
				if (isMobile || openPDFInNewTab) {
					window.open(url, "_blank", "noopener,noreferrer");
				} else {
					const a = document.createElement("a");
					a.href = url;
					a.download = pdfData.name as string;
					a.click();
				}
			}
		};

		wrapper.addEventListener("click", handleClick);

		return () => {
			wrapper.removeEventListener("click", handleClick);
		};
	}, [pdfBlob]);

	useEffect(() => {
		// cleanup previous url
		if (pdfUrlRef.current) {
			URL.revokeObjectURL(pdfUrlRef.current);
			pdfUrlRef.current = null;
		}

		if (!pdfBlob) {
			return;
		}

		// create a stable url for this blob
		pdfUrlRef.current = URL.createObjectURL(pdfBlob);

		// revoke only when blob changes or component unmounts
		return () => {
			if (pdfUrlRef.current) {
				URL.revokeObjectURL(pdfUrlRef.current);
				pdfUrlRef.current = null;
			}
		};
	}, [pdfBlob]);

	return (
		<>
			{error ? (
				<div className="flex flex-col gap-8 py-8">
					<p className="text-red-600">
						<b>Beim Erstellen des PDFs ist ein Fehler aufgetreten:</b>
						<br />
						{error}
					</p>
					<Button
						onClick={async () => {
							setError(null);
							if (pdfError) {
								console.log(
									"retrigger getWMSForBuildingAndStartPDFImageFetch 🚀🚀🚀",
								);
								setPDFError(null);
								clearPDFKeys();
								try {
									if (!!locationData) {
										await getWMSForBuildingAndStartPDFImageFetch(
											locationData,
											setPDFKeys,
											addToNumberOfFetchedPDFImages,
										);
									} else {
										throw new Error("No locationData provided");
									}
								} catch (err) {
									setError(err as string);
								}
							} else {
								makePDF();
							}
						}}
					>
						Erneut probieren
					</Button>
					<div className="divider" />
				</div>
			) : (
				<>
					<div ref={wrapperRef}>
						{pdfBlob ? (
							<DownloadItem
								buttonText={t("floodCheck.reportDownload.button")}
								description={t("floodCheck.reportDownload.description")}
								downloadUrl="#results"
								fileType={t("floodCheck.reportDownload.fileInfo", {
									size: `${pdfSizeKB} MB`,
								})}
								date={getToday()}
								title={t("floodCheck.reportDownload.title")}
							/>
						) : (
							<>
								<div className="flex min-h-[150px] items-center justify-end py-8">
									<div className="flex flex-col gap-2">
										<Spinner
											text="HochwasserCheck Report wird erstellt..."
											position="right"
											size="small"
										/>
										<p className="ml-10 italic">
											*Dies kann einen Moment dauern
										</p>
										<div className="ml-10 flex flex-col gap-2 pt-2">
											{checks.map((check) => {
												const isDone = done.includes(check.id);
												return (
													<div
														className="flex items-center gap-2"
														key={check.id}
													>
														<FontAwesomeIcon
															icon={faCheck}
															className={cn(
																"flex-shrink-0 text-[18px] text-[#22c55e]",
																!isDone && "invisible",
															)}
														/>
														<span className={cn(isDone && "font-bold")}>
															{check.id !== "images"
																? isDone
																	? check.text
																	: check.loading
																: numberOfPDFImagesToFetch === 0
																	? check.loading
																	: `${numberOfFetchedPDFImages} von ${numberOfPDFImagesToFetch + addToImages} Bildern erstellt`}
														</span>
													</div>
												);
											})}
										</div>
									</div>
								</div>
								<div className="divider" />
							</>
						)}
					</div>
				</>
			)}
		</>
	);
};

export default ReportPDF;
