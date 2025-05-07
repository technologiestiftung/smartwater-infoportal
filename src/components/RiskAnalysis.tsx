"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { FormProperty } from "berlin-ui-library/dist/components/FormWrapper/FormFieldWrapper";
import {
	Button,
	Form,
	FormWrapper,
	FormFieldWrapper,
	Image,
} from "berlin-ui-library";
import { useForm } from "react-hook-form";

interface RiskAnalysisProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSubmit: (data: any) => void;
}

const RiskAnalysis: React.FC<RiskAnalysisProps> = ({
	onSubmit,
}: RiskAnalysisProps) => {
	const t = useTranslations();
	const [currentStep, setCurrentStep] = useState(0);
	const methods = useForm({
		defaultValues: {
			addresse: "",
			untergeschoss: "",
			floodProtection: false,
		},
	});
	const properties: FormProperty[] = [
		{
			id: "q1",
			name: t("floodCheck.questions.q1.text"),
			type: "checkbox",
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

	const handleNext = async () => {
		const fieldName = properties[currentStep]
			.id as keyof typeof methods.control._defaultValues;
		const isValid = await methods.trigger(fieldName);

		if (isValid && currentStep < properties.length - 1) {
			setCurrentStep(currentStep + 1);
		} else if (isValid && currentStep === properties.length - 1) {
			methods.handleSubmit(onSubmit)();
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

							<div className="mt-4 flex w-full flex-col space-y-4">
								{currentStep > 0 && (
									<Button
										variant="back-link"
										className="self-start"
										onClick={handleBack}
										type="button"
									>
										{t("common.back")}
									</Button>
								)}
								<Button
									onClick={handleNext}
									type="button"
									className="text-left"
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
					<div className="">
						<Image
							src="/rueckstausicherung.png"
							alt={t("floodCheck.questions.q4.image.alt")}
							caption={t("floodCheck.questions.q4.image.caption")}
							copyright={t("floodCheck.questions.q4.image.copyright")}
						/>
					</div>
				)}
				{currentStep === 4 && (
					<div className="">
						<Image
							src="/ablaeufe.png"
							alt={t("floodCheck.questions.q5.image.alt")}
							caption={t("floodCheck.questions.q5.image.caption")}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default RiskAnalysis;
