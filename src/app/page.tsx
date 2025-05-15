"use client";
import TextBlock from "@/components/TextBlock";
import Warning from "@/components/Warning";
import {
	Button,
	Form,
	FormFieldWrapper,
	FormWrapper,
	Image,
} from "berlin-ui-library";
import { FormProperty } from "berlin-ui-library/dist/components/FormWrapper/FormFieldWrapper";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function Home() {
	const t = useTranslations("home");
	const router = useRouter();
	const methods = useForm({
		defaultValues: {
			addresse: "",
		},
	});
	const property: FormProperty = {
		id: "addresse",
		name: "Addresse",
		type: "text",
		description: "Enter your full addresse",
		placeholder: "John Doe",
		isRequired: true,
	};

	const handleSubmit = () => {
		return methods.handleSubmit((data) => {
			console.warn(data);
		});
	};

	return (
		<div className="flex w-full flex-col gap-12 px-5 py-8 lg:px-0">
			<section>
				<div className="flex flex-col gap-6">
					<h1 className="">{t("pageTitle")}</h1>
					<h2 className="">{t("whatIsIt.title")}</h2>
					<p className="">
						{t("whatIsIt.quote")} <br />
						{t("whatIsIt.description1")}
					</p>
					<p className="">{t("whatIsIt.description2")}</p>
				</div>
			</section>
			<div className="divider px-5" />
			<section className="flex flex-col gap-6">
				<h2 className="">{t("amIAffected.title")}</h2>
				<p className="">{t("amIAffected.description")}</p>
				<p className="">{t("amIAffected.cta")}</p>
				<FormWrapper>
					<Form {...methods}>
						<form className="flex flex-col gap-8" onSubmit={handleSubmit()}>
							<FormFieldWrapper formProperty={property} form={methods} />
							<Button
								className="w-full justify-end self-start lg:w-fit"
								onClick={() => {
									router.push("/wasser-check");
								}}
								type="submit"
							>
								{t("addressCheck.button")}
							</Button>
						</form>
					</Form>
				</FormWrapper>
			</section>
			<section className="w-full">
				<TextBlock
					desktopColSpans={{ col1: 2, col2: 3 }}
					className="w-full gap-6"
					reverseDesktopColumns={true}
					slotA={
						<div className="flex w-full flex-col gap-6">
							<div className="flex flex-col gap-2">
								<h2 className="">{t("howToProtect.title")}</h2>
								<p className="">{t("howToProtect.ownerInfo")}</p>
							</div>
							<p className="">{t("howToProtect.tenantInfo")}</p>
							<p className="">{t("howToProtect.generalRule")}</p>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
							src="/imagery.png"
							alt={t("howToProtect.image.alt")}
							caption={t("howToProtect.image.caption")}
							copyright={t("howToProtect.image.copyright")}
						/>
					}
					slotC={
						<div className="flex w-full flex-col gap-6">
							<p className="">{t("howToProtect.recommendations.info")}</p>
							<Button
								className="w-full self-start lg:w-fit"
								onClick={() => {
									router.push("/handlungsempfehlungen");
								}}
							>
								{t("howToProtect.recommendations.button")}
							</Button>
						</div>
					}
				/>
			</section>
			<div className="divider" />
			<section className="">
				<TextBlock
					desktopColSpans={{ col1: 3, col2: 2 }}
					className="w-full gap-6"
					slotA={
						<div className="flex w-full flex-col gap-6">
							<h2 className="">{t("floodRadar.title")}</h2>
							<h3 className="">{t("floodRadar.subtitle")}</h3>
						</div>
					}
					slotB={<Warning type="widget" />}
					slotC={
						<p className="">
							{t.rich("floodRadar.description", {
								link: (chunks) => (
									<div
										onClick={() => {
											router.push("/link");
										}}
										className="text-text-link"
									>
										{chunks}
									</div>
								),
							})}
						</p>
					}
				/>
			</section>
			<div className="divider" />
			<section className="">
				<TextBlock
					desktopColSpans={{ col1: 2, col2: 3 }}
					className="w-full gap-6"
					reverseDesktopColumns={true}
					slotA={
						<div className="flex w-full flex-col gap-6">
							<h2 className="">{t("backgroundInfo.title")}</h2>
							<p className="">{t("backgroundInfo.questions")}</p>
							<p className="">{t("backgroundInfo.answer")}</p>
						</div>
					}
					slotB={
						<Image
							className="-mx-5 w-screen max-w-none lg:-mx-0 lg:w-auto"
							src="/imagery.png"
							alt={t("howToProtect.image.alt")}
							caption={t("howToProtect.image.caption")}
							copyright={t("howToProtect.image.copyright")}
						/>
					}
					slotC={
						<div className="flex w-full flex-col gap-6">
							<Button
								className="w-full self-start lg:w-fit"
								onClick={() => {
									router.push("/allgemeine-informationen");
								}}
							>
								{t("backgroundInfo.button")}
							</Button>
						</div>
					}
				/>
			</section>
		</div>
	);
}
