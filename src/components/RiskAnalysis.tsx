"use client";
import {
	Button,
	Form,
	FormFieldWrapper,
	FormWrapper,
	Image,
} from "berlin-ui-library";
import { FormProperty } from "berlin-ui-library/dist/elements/FormWrapper/FormFieldWrapper";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import riskConfig from "../config/floodRiskConfig.json";
import useStore from "../store/defaultStore";
import TextBlock from "./TextBlock";

const RiskAnalysis = () => {
	const t = useTranslations();
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(0);
	const [questionSkipped, setQuestionsSkipped] = useState<boolean>(false);
	const [showLoading, setShowLoading] = useState<boolean>(false);
	const {
		floodRiskAnswers,
		updateFloodRiskAnswer,
		removeFloodRiskAnswer,
		calculateAndSetResult,
	} = useStore();

	// Get questions from config, filter out auto questions
	const questions = riskConfig.questions.filter((q) => q.type !== "auto");

	const properties: FormProperty[] = questions.map((question) => ({
		id: question.id,
		name: t(`${question.translationKey}.text`),
		helperText: t(`${question.translationKey}.helperText`),
		type: question.type as "radio" | "checkbox",
		isRequired: question.isRequired,
		options: question.options.map((option) => ({
			label: t(`${question.translationKey}.options.${option.value}`),
			value: String(option.value),
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
		let nextStep = currentStep + 1;

		// Manual validation for required questions
		if (currentProperty.isRequired) {
			let isValid = true;

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

		// check if the next question needs to be skipped
		if (
			questions[currentStep] &&
			questions[currentStep].options &&
			questions[currentStep].id === "q1"
		) {
			const findCurrentOption = questions[currentStep].options.find(
				(currentOption) => currentOption.value === currentValue,
			);
			if (findCurrentOption) {
				const skip =
					"skipNextQuestion" in findCurrentOption
						? Boolean(findCurrentOption.skipNextQuestion)
						: false;
				if (skip) {
					// skip over the next question
					setQuestionsSkipped(true);
					removeFloodRiskAnswer("q2");
					methods.setValue("q2", "");
					nextStep += 1;
				} else if (questionSkipped) {
					setQuestionsSkipped(false);
				}
			}
		}

		// Save current answer to store
		if (currentValue !== undefined) {
			updateFloodRiskAnswer(fieldName, currentValue);
		}

		if (currentStep < properties.length - 1) {
			setCurrentStep(nextStep);
		} else {
			// Final step - calculate score and submit
			setShowLoading(true);
			calculateAndSetResult();
			router.push("/hochwasser-check#results");
		}
	};

	const handleBack = () => {
		if (currentStep > 0) {
			if (questionSkipped && currentStep - 1 === 2) {
				setCurrentStep(currentStep - 2);
			} else {
				setCurrentStep(currentStep - 1);
			}
		}
	};

	const currentProperty = properties[currentStep];
	const currentQuestion = questions[currentStep];

	const displayCurrentStep = () => {
		if (questionSkipped && currentStep > 2) {
			return currentStep;
		}
		return currentStep + 1;
	};

	return (
		<div className={``}>
			<div className="flex w-full flex-col gap-6">
				<h1 className=""></h1>
				<h2>
					{t("floodCheck.questionLabel", {
						current: displayCurrentStep(),
						total: questionSkipped ? properties.length - 1 : properties.length,
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
									loading={showLoading}
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
							<div className="flex w-full flex-col gap-6 bg-panel-heavy p-6">
								<h3 className="">
									{t(`${currentQuestion.translationKey}.title`)}
								</h3>
								{/* Handle both single description and multiple descriptions */}
								{currentQuestion.translationKey.includes("q3") ||
								currentQuestion.translationKey.includes("q4") ? (
									<>
										<p className="">
											{t(`${currentQuestion.translationKey}.description1`)}
										</p>
										<p className="">
											{t(`${currentQuestion.translationKey}.description2`)}
										</p>
									</>
								) : (
									<p className="">
										{t(`${currentQuestion.translationKey}.description`)}
									</p>
								)}
							</div>
						}
					/>
				)}
			</div>
		</div>
	);
};

export default RiskAnalysis;
