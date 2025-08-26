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
import riskConfig from "../config/floodRiskConfig.json";

interface RiskAnalysisProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSubmit: (data: any) => void;
}

const RiskAnalysis: React.FC<RiskAnalysisProps> = ({
	onSubmit,
}: RiskAnalysisProps) => {
	const t = useTranslations();
	const [currentStep, setCurrentStep] = useState(0);
	const { floodRiskAnswers, updateFloodRiskAnswer, calculateAndSetResult } =
		useStore();

	// Get questions from config, filter out auto questions
	const questions = riskConfig.questions.filter((q) => q.type !== "auto");

	const properties: FormProperty[] = questions.map((question) => ({
		id: question.id,
		name: t(`${question.translationKey}.text`),
		type: question.type as "radio" | "checkbox",
		isRequired: question.isRequired,
		options: question.options.map((option) => ({
			label: t(`${question.translationKey}.options.${option.value}`),
			value: String(option.value), // Convert to string for FormProperty
		})),
	}));

	// Create default values from stored answers
	const defaultValues = Object.keys(floodRiskAnswers).reduce(
		(acc, key) => {
			const answer = floodRiskAnswers[key];
			acc[key] = answer?.value || "";
			return acc;
		},
		{} as Record<string, string | string[] | number>,
	);

	const methods = useForm({
		defaultValues,
		mode: "onChange",
	});

	const handleNext = async () => {
		const currentProperty = properties[currentStep];
		const fieldName = currentProperty.id;
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
			calculateAndSetResult();
			onSubmit(floodRiskAnswers);
		}
	};

	const handleBack = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const currentProperty = properties[currentStep];
	const currentQuestion = questions[currentStep];

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
				{/* Dynamic image display based on config */}
				{currentQuestion?.hasImage && (
					<TextBlock
						desktopColSpans={{ col1: 1, col2: 1 }}
						className="w-full gap-6"
						reverseDesktopColumns={false}
						slotA={
							<Image
								className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
								src={currentQuestion.imageSrc}
								alt={t(`${currentQuestion.translationKey}.image.alt`)}
								caption={t(`${currentQuestion.translationKey}.image.caption`)}
								copyright={t(
									`${currentQuestion.translationKey}.image.copyright`,
								)}
							/>
						}
						slotB={
							<div className="bg-panel-heavy flex w-full flex-col gap-6 p-6">
								<h3 className="">
									{t(`${currentQuestion.translationKey}.title`)}
								</h3>
								<p className="">
									{t(`${currentQuestion.translationKey}.description`)}
								</p>
							</div>
						}
					/>
				)}
			</div>
		</div>
	);
};

export default RiskAnalysis;
