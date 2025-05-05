"use client";
import { Button, Form, FormFieldWrapper, FormWrapper } from "berlin-ui-library";
import { FormProperty } from "berlin-ui-library/dist/components/FormWrapper/FormFieldWrapper";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useState } from "react";

export default function Questionnaire() {
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
			id: "address",
			name: t("home.addressCheck.label"),
			type: "text",
			description: t("home.addressCheck.description"),
			placeholder: "Landstraße 1, 12345 Berlin",
			isRequired: true,
		},
		{
			id: "untergeschoss",
			name: "Untergeschoss",
			type: "radio",
			description: "Ist Ihr Untergeschoss betroffen?",
			options: [
				{ label: "Ja", value: "ja" },
				{ label: "Nein", value: "nein" },
			],
			isRequired: true,
		},
		{
			id: "floodProtection",
			name: "Hochwasserschutz",
			type: "checkbox",
			description:
				"Ich habe einen Hochwasserschutz, der bei Starkregen funktioniert.",
			isRequired: false,
		},
	];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const onSubmit = (data: any) => {
		console.warn("Form Submitted:", data);
	};

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
		<div className="flex w-full flex-col justify-start gap-6">
			<Link href="/">
				<Button variant="back-link" className="self-start">
					{t("common.backToStart")}
				</Button>
			</Link>
			<div className="flex w-full flex-col gap-6">
				<h1 className=""></h1>
				<h2>
					{t("questionnaire.questionLabel", {
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
										{t("questionnaire.navigation.backToIntermediate")}
									</Button>
								)}
								{currentStep === 0 && <div />}

								<Button onClick={handleNext} type="button">
									{currentStep === properties.length - 1
										? t("questionnaire.navigation.submit")
										: t("questionnaire.navigation.next")}
								</Button>
							</div>
						</div>
					</Form>
				</FormWrapper>
			</div>
		</div>
	);
}
