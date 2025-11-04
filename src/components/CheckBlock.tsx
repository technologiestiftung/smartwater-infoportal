"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { FormProperty } from "berlin-ui-library/dist/elements/FormWrapper/FormFieldWrapper";
import { Button, Form, FormWrapper, FormFieldWrapper } from "berlin-ui-library";
import { useForm } from "react-hook-form";
import useStore from "../store/defaultStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";

interface CheckBlockProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSubmit: (data: any) => void;
}

const CheckBlock: React.FC<CheckBlockProps> = ({
	onSubmit,
}: CheckBlockProps) => {
	const t = useTranslations();
	const { currentUserAddress } = useStore();

	const properties: FormProperty[] = [
		{
			id: "q1",
			name: "",
			type: "radio",
			options: [
				{
					label: "Ja",
					value: "yes",
				},
				{
					label: "Nein",
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
									<p className="mt-[3px]">{currentUserAddress.display_name}</p>
								</>
							)}
						</section>
					</div>
					<div className="flex w-full flex-col gap-8">
						<div className="flex flex-col gap-1.5">
							<p className="font-bold">{t("floodCheck.start.question")}</p>
							<p className="">{t("floodCheck.start.questionDescription")}</p>
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
								onClick={() => onSubmit(question)}
								type="button"
								disabled={!question}
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
