"use client";
import {
	Button,
	Form,
	FormFieldWrapper,
	FormWrapper,
	Label,
	Spinner,
} from "berlin-ui-library";
import { FormProperty } from "berlin-ui-library/dist/elements/FormWrapper/FormFieldWrapper";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import useStore from "@/store/defaultStore";
import { getAddressResults } from "@/server/actions/getAddressResults";
import LocationButton from "./LocationButton";
import { addLabelToAddressResults, containsNumber } from "@/lib/utils/mapUtils";

export default function AddressSearch() {
	const t = useTranslations("home");
	const router = useRouter();

	const setCurrentUserAddress = useStore(
		(state) => state.setCurrentUserAddress,
	);

	const showTestingFeatures = useStore((state) => state.showTestingFeatures);

	const [showLoading, setShowLoading] = useState<boolean>(false);

	const currentUserAddress = useStore((state) => state.currentUserAddress);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [results, setResults] = useState<any[]>([]);
	const [resultClicked, setResultClicked] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const methods = useForm({
		defaultValues: {
			addresse: "",
		},
	});
	const { setValue, getValues } = methods;
	const property: FormProperty = {
		id: "addresse",
		name: t("addressCheck.label"),
		type: "text",
		description: t("addressCheck.description"),
		placeholder: t("addressCheck.placeholder"),
		isRequired: true,
	};

	const handleSubmit = () => {
		return methods.handleSubmit(() => {
			const addresse = getValues("addresse");
			if (addresse) {
				if (!currentUserAddress) {
					setError("Bitte wählen Sie eine Adresse aus.");
				} else {
					router.push("/hochwasser-check");
				}
			} else {
				setError("Bitte geben Sie eine Adresse ein.");
			}
			return;
		});
	};

	const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isFetching = useRef(false);

	const fetchData = async (search: string) => {
		if (isFetching.current) {
			return;
		}
		isFetching.current = true;
		setShowLoading(true);

		try {
			const data = await getAddressResults(search);

			if (data?.error) {
				setError(data.error);
				return;
			}

			if (data.length === 0) {
				setError(
					"Keine Ergebnisse gefunden. Bitte geben Sie Ihre exakte Adresse inklusive Hausnummer ein.",
				);
				setResults([]);
				return;
			}

			setResults(addLabelToAddressResults(data));
		} catch (e) {
			throw new Error(`Error fetching data: ${e}`);
		} finally {
			isFetching.current = false;
			setShowLoading(false);
		}
	};

	const handleChange = (e: FormEvent<HTMLFormElement>) => {
		const target = e.target as HTMLInputElement;
		if (resultClicked) {
			setResultClicked(false);
		}
		if (target.name === "addresse") {
			const value = target.value;

			if (value.length < 3) {
				setResults([]);
				setShowLoading(false);
				return;
			} else if (error) {
				setError("");
			}

			if (debounceTimeout.current) {
				clearTimeout(debounceTimeout.current);
			}

			debounceTimeout.current = setTimeout(() => {
				fetchData(value);
			}, 1000);
		}
	};

	useEffect(() => {
		if (currentUserAddress) {
			setValue("addresse", currentUserAddress.label);
			setResultClicked(true);
		}
	}, [currentUserAddress, setValue]);

	return (
		<FormWrapper>
			<Form {...methods}>
				<form
					className="flex flex-col gap-8"
					onSubmit={handleSubmit()}
					onChange={handleChange}
				>
					<div className="">
						<FormFieldWrapper formProperty={property} form={methods} />
						{results.length > 0 && !showLoading && (
							<div className="flex flex-col gap-2 px-4 pb-4 pt-8">
								<strong>{t("addressCheck.result")}</strong>
								{!results.some((result) => result.hasHouseNumber) && (
									<Label className="text-destructive text-primary">
										{containsNumber(getValues("addresse") ?? "")
											? t("addressCheck.probablyNoAddress")
											: t("addressCheck.pleaseAddHouseNumber")}
									</Label>
								)}
								<ul className="list-disc ps-6 [&>li::marker]:text-[var(--primary)]">
									<>
										{results.map((result, index) => {
											return (
												<li key={index}>
													{result.hasHouseNumber ? (
														<Button
															onClick={() => {
																setError("");
																setValue("addresse", result.label);
																setCurrentUserAddress(result);
																setResults([]);
															}}
															variant="link"
														>
															{result.label}
														</Button>
													) : (
														<span>{result.label}</span>
													)}
													{showTestingFeatures.includes(
														"addressSearchDetails",
													) && (
														<>
															<p className="text-xs">
																Display name:{" "}
																<span className="font-bold">
																	{result.label}
																</span>
															</p>
															<p className="text-xs">
																Addresstype:{" "}
																<span className="font-bold">
																	{result.addresstype}
																</span>
															</p>
															<p className="text-xs">
																Class:{" "}
																<span className="font-bold">
																	{result.class}
																</span>
															</p>
															<p className="text-xs">
																OSM Type:{" "}
																<span className="font-bold">
																	{result.osm_type}
																</span>
															</p>
															<p className="text-xs">
																Type:{" "}
																<span className="font-bold">{result.type}</span>
															</p>
															<p className="text-xs">
																Importance:{" "}
																<span className="font-bold">
																	{result.importance}
																</span>
															</p>
														</>
													)}
												</li>
											);
										})}
									</>
								</ul>
							</div>
						)}
					</div>
					{error && (
						<Label className="text-destructive text-primary">{error}</Label>
					)}
					{showLoading && (
						<div className="align-start flex">
							<Spinner size="small" />
						</div>
					)}
					<div className="flex flex-col gap-4 lg:flex-row">
						<Button
							className="w-full justify-end self-start lg:w-fit"
							type="submit"
						>
							{(() => {
								if (showLoading) {
									return t("addressCheck.loading");
								}
								return t("addressCheck.button");
							})()}
						</Button>
						{showTestingFeatures.includes("locationButton") && (
							<div className="border-1 border-black p-4">
								<LocationButton
									resultsLoaded={(resultsFromLocationButton) => {
										setResults(
											addLabelToAddressResults(resultsFromLocationButton),
										);
									}}
								/>
							</div>
						)}
					</div>
				</form>
			</Form>
		</FormWrapper>
	);
}
