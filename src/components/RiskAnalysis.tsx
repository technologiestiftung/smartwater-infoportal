"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { FormProperty } from "berlin-ui-library/dist/elements/FormWrapper/FormFieldWrapper";
import {
	Button,
	Form,
	FormWrapper,
	FormFieldWrapper,
	Image,
} from "berlin-ui-library";
import { useForm } from "react-hook-form";
import TextBlock from "./TextBlock";
import useStore from "../store/defaultStore";
import {
	calculateFloodRiskScore,
	validateAnswers,
	RiskMessages,
} from "../utils/floodRiskCalculator";

interface RiskAnalysisProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSubmit: (data: any) => void;
}

const RiskAnalysis: React.FC<RiskAnalysisProps> = ({
	onSubmit,
}: RiskAnalysisProps) => {
	const t = useTranslations();
	const [currentStep, setCurrentStep] = useState(0);
	const { floodRiskAnswers, updateFloodRiskAnswer, setFloodRiskResult } =
		useStore();

	const properties: FormProperty[] = [
		{
			id: "q1",
			name: t("floodCheck.questions.q1.text"),
			type: "radio",
			isRequired: true,
			options: [
				{
					label: t("floodCheck.questions.q1.options.yesWithWindow"),
					value: "yesWithWindow",
				},
				{
					label: t("floodCheck.questions.q1.options.yesWithoutWindow"),
					value: "yesWithoutWindow",
				},
				{ label: t("floodCheck.questions.q1.options.no"), value: "no" },
				{
					label: t("floodCheck.questions.q1.options.noInformation"),
					value: "noInformation",
				},
			],
		},
		{
			id: "q2",
			name: t("floodCheck.questions.q2.text"),
			type: "checkbox",
			isRequired: true,
			options: [
				{
					label: t("floodCheck.questions.q2.options.living"),
					value: "living",
				},
				{
					label: t("floodCheck.questions.q2.options.utility"),
					value: "utility",
				},
				{
					label: t("floodCheck.questions.q2.options.storageLowValue"),
					value: "storageLowValue",
				},
				{
					label: t("floodCheck.questions.q2.options.storageHighValue"),
					value: "storageHighValue",
				},
				{
					label: t("floodCheck.questions.q2.options.none"),
					value: "none",
				},
				{
					label: t("floodCheck.questions.q2.options.noInformation"),
					value: "noInformation",
				},
			],
		},
		{
			id: "q3",
			name: t("floodCheck.questions.q3.text"),
			type: "radio",
			isRequired: true,
			options: [
				{
					label: t("floodCheck.questions.q3.options.one"),
					value: "one",
				},
				{
					label: t("floodCheck.questions.q3.options.two"),
					value: "two",
				},
				{
					label: t("floodCheck.questions.q3.options.threeOrMore"),
					value: "threeOrMore",
				},
				{
					label: t("floodCheck.questions.q3.options.no"),
					value: "no",
				},
				{
					label: t("floodCheck.questions.q3.options.noInformation"),
					value: "noInformation",
				},
			],
		},
		{
			id: "q4",
			name: t("floodCheck.questions.q4.text"),
			type: "radio",
			isRequired: true,
			options: [
				{
					label: t("floodCheck.questions.q4.options.yesGood"),
					value: "yesGood",
				},
				{
					label: t("floodCheck.questions.q4.options.yesUnknown"),
					value: "yesUnknown",
				},
				{
					label: t("floodCheck.questions.q4.options.no"),
					value: "no",
				},
				{
					label: t("floodCheck.questions.q4.options.noInformation"),
					value: "noInformation",
				},
			],
		},
		{
			id: "q5",
			name: t("floodCheck.questions.q5.text"),
			type: "radio",
			isRequired: true,
			options: [
				{
					label: t("floodCheck.questions.q5.options.good"),
					value: "good",
				},
				{
					label: t("floodCheck.questions.q5.options.bad"),
					value: "bad",
				},
				{
					label: t("floodCheck.questions.q5.options.unknown"),
					value: "unknown",
				},
				{
					label: t("floodCheck.questions.q5.options.noInformation"),
					value: "noInformation",
				},
			],
		},
		{
			id: "q6",
			name: t("floodCheck.questions.q6.text"),
			type: "radio",
			isRequired: true,
			options: [
				{
					label: t("floodCheck.questions.q6.options.one"),
					value: "one",
				},
				{
					label: t("floodCheck.questions.q6.options.twoOrMore"),
					value: "twoOrMore",
				},
				{
					label: t("floodCheck.questions.q6.options.no"),
					value: "no",
				},
				{
					label: t("floodCheck.questions.q6.options.noInformation"),
					value: "noInformation",
				},
			],
		},
	];

	const methods = useForm({
		defaultValues: {
			...floodRiskAnswers,
			// Ensure radio fields have empty string defaults (controlled)
			q3: floodRiskAnswers.q3 || "",
			q4: floodRiskAnswers.q4 || "",
			q5: floodRiskAnswers.q5 || "",
			q6: floodRiskAnswers.q6 || "",
		},
		mode: "onChange",
	});

	const handleNext = async () => {
		const currentProperty = properties[currentStep];
		const fieldName = currentProperty.id as keyof typeof floodRiskAnswers;
		const currentValue = methods.getValues(fieldName);

		// Manual validation for required questions
		if (currentProperty.isRequired) {
			let isValid = true;

			// For checkbox questions, check if at least one option is selected
			if (currentProperty.type === "checkbox") {
				if (
					!currentValue ||
					(Array.isArray(currentValue) && currentValue.length === 0)
				) {
					methods.setError(fieldName, {
						type: "required",
						message: t("common.validation.selectAtLeastOne"),
					});
					isValid = false;
				}
			}

			// For radio questions, check if an option is selected
			if (currentProperty.type === "radio") {
				if (
					!currentValue ||
					currentValue === "" ||
					currentValue === null ||
					currentValue === undefined
				) {
					methods.setError(fieldName, {
						type: "required",
						message: t("common.validation.selectOne"),
					});
					isValid = false;
				}
			}

			if (!isValid) {
				return;
			}
		}

		// Clear any previous errors
		methods.clearErrors(fieldName);

		// Save current answer to store
		if (currentValue !== undefined) {
			updateFloodRiskAnswer(fieldName, currentValue);
		}

		if (currentStep < properties.length - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			// Final step - calculate score and submit
			const allAnswers = { ...floodRiskAnswers, [fieldName]: currentValue };

			// Prepare risk messages for translation
			const riskMessages: RiskMessages = {
				insufficientData: t("floodCheck.riskCalculation.insufficientData"),
				riskLevels: {
					low: t("floodCheck.riskCalculation.riskLevels.low"),
					moderate: t("floodCheck.riskCalculation.riskLevels.moderate"),
					high: t("floodCheck.riskCalculation.riskLevels.high"),
				},
			};

			if (validateAnswers(allAnswers)) {
				const result = calculateFloodRiskScore(allAnswers, riskMessages);
				setFloodRiskResult(result);
				onSubmit(allAnswers);
			} else {
				// Not enough answers provided
				setFloodRiskResult({
					score: 0,
					riskLevel: "insufficient-data",
					message: t("floodCheck.riskCalculation.insufficientAnswers"),
				});
				onSubmit(allAnswers);
			}
		}
	};

	const handleBack = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const currentProperty = properties[currentStep];

	return (
		<div className={``}>
			<div className="flex w-full flex-col gap-6">
				<h1 className=""></h1>
				<h2>
					{t("floodCheck.questionLabel", {
						current: currentStep + 1,
						total: properties.length,
					})}{" "}
				</h2>
				<FormWrapper>
					<Form {...methods}>
						<div className="flex w-full flex-col gap-8">
							{currentProperty && (
								<FormFieldWrapper
									key={currentProperty.id}
									formProperty={currentProperty}
									form={methods}
								/>
							)}

							<div className="mt-4 flex w-full flex-col items-center space-y-4 lg:flex-row lg:justify-between lg:space-y-0">
								{currentStep > 0 && (
									<Button
										className="w-full justify-end self-start lg:w-fit lg:self-center"
										variant="back-link"
										onClick={handleBack}
										type="button"
									>
										{t("common.back")}
									</Button>
								)}
								<Button
									className="w-full self-start lg:w-fit"
									onClick={handleNext}
									type="button"
								>
									{currentStep === properties.length - 1
										? t("floodCheck.navigation.submit")
										: t("floodCheck.navigation.next")}
								</Button>
							</div>
						</div>
					</Form>
				</FormWrapper>
				{currentStep === 3 && (
					<TextBlock
						desktopColSpans={{ col1: 1, col2: 1 }}
						className="w-full gap-6"
						reverseDesktopColumns={false}
						slotA={
							<Image
								className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
								src="/rueckstausicherung.png"
								alt={t("floodCheck.questions.q4.image.alt")}
								caption={t("floodCheck.questions.q4.image.caption")}
								copyright={t("floodCheck.questions.q4.image.copyright")}
							/>
						}
						slotB={
							<div className="bg-panel-heavy flex w-full flex-col gap-6 p-6">
								<h3 className="">{t("floodCheck.questions.q4.title")}</h3>
								<p className="">{t("floodCheck.questions.q4.description")}</p>
							</div>
						}
					/>
				)}
				{currentStep === 4 && (
					<div className="">
						<TextBlock
							desktopColSpans={{ col1: 1, col2: 1 }}
							className="w-full gap-6"
							reverseDesktopColumns={false}
							slotA={
								<Image
									src="/ablaeufe.png"
									alt={t("floodCheck.questions.q5.image.alt")}
									caption={t("floodCheck.questions.q5.image.caption")}
								/>
							}
							slotB={
								<div className="bg-panel-heavy flex w-full flex-col gap-6 p-6">
									<h3 className="">{t("floodCheck.questions.q5.title")}</h3>
									<p className="">{t("floodCheck.questions.q5.description")}</p>
								</div>
							}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default RiskAnalysis;
