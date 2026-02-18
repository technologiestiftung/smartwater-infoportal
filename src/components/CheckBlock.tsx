"use client";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Form, FormFieldWrapper, FormWrapper } from "berlin-ui-library";
import { FormProperty } from "berlin-ui-library/dist/elements/FormWrapper/FormFieldWrapper";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import useStore from "../store/defaultStore";

interface CheckBlockProps {
	onSubmit: (data: any) => void;
}

const CheckBlock: React.FC<CheckBlockProps> = ({
	onSubmit,
}: CheckBlockProps) => {
	const t = useTranslations();
	const { currentUserAddress } = useStore();
	const [showLoading, setShowLoading] = useState<boolean>(false);

	const properties: FormProperty[] = [
		{
			id: "q1",
			name: "",
			type: "radio",
			options: [
				{
					label:
						"Ja, ich möchte den Fragebogen mit sechs Fragen beantworten, um <b>zusätzlich</b> individualisierte Handlungsempfehlungen erhalten.",
					value: "yes",
				},
				{
					label:
						"Nein, ich möchte <b>ausschließlich</b> eine Einschätzung der Gefährdungslage auf Basis des vorhandenen Kartenmaterials erhalten.",
					value: "no",
				},
			],
		},
	];

	const methods = useForm({
		mode: "onChange",
	});

	const question = methods.watch("q1");

	const currentProperty = properties[0];

	return (
		<FormWrapper>
			<Form {...methods}>
				<div className="flex flex-col gap-7">
					<div className="flex flex-col gap-1.5">
						<p className="font-bold">{t("floodCheck.start.locationTitle")}</p>
						<section className="flex items-center gap-2">
							{currentUserAddress && (
								<>
									<FontAwesomeIcon
										icon={faLocationDot}
										className="text-[18px] text-black"
									/>
									<p className="mt-[3px]">{currentUserAddress.name}</p>
								</>
							)}
						</section>
					</div>
					<div className="flex w-full flex-col gap-8">
						<div className="flex flex-col gap-1.5">
							<p className="font-bold">{t("floodCheck.start.question")}</p>
							{/* <p className="">{t("floodCheck.start.questionDescription")}</p> */}
							{currentProperty && (
								<FormFieldWrapper
									key={currentProperty.id}
									formProperty={currentProperty}
									form={methods}
								/>
							)}
						</div>
						<div className="mt-4 flex w-full flex-col items-center space-y-4 lg:flex-row lg:justify-end lg:space-y-0">
							<Button
								className="w-full self-start lg:w-fit"
								onClick={() => {
									setShowLoading(true);
									onSubmit(question);
								}}
								type="button"
								disabled={!question}
								loading={showLoading}
							>
								{question === "yes" ? (
									<> {t("floodCheck.start.formButtons.toQuestionnaire")}</>
								) : (
									<> {t("floodCheck.start.formButtons.toResult")}</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</Form>
		</FormWrapper>
	);
};

export default CheckBlock;
