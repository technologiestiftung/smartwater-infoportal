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
import LocationButton from "./LocationButton";
import { CurrentUserAddress } from "@/lib/types";
import { searchAddresses } from "@/server/actions/searchAddresses";

export default function AddressSearch() {
	const t = useTranslations("home");
	const router = useRouter();

	const setCurrentUserAddress = useStore(
		(state) => state.setCurrentUserAddress,
	);

	const [showLoading, setShowLoading] = useState<boolean>(false);

	const currentUserAddress = useStore((state) => state.currentUserAddress);

	const [results, setResults] = useState<CurrentUserAddress[]>([]);
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
					setError(t("addressCheck.errorNoResultSelected"));
				} else {
					router.push("/hochwasser-check");
				}
			} else {
				setError(t("addressCheck.errorNoAddress"));
			}
			return;
		});
	};

	const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isFetching = useRef(false);

	const fetchData = async (
		search: string,
		lat: number | undefined,
		lon: number | undefined,
	) => {
		if (isFetching.current) {
			return;
		}
		isFetching.current = true;
		setShowLoading(true);
		setError("");

		try {
			const data = await searchAddresses(search, lat, lon);
			// console.log("data :>> ", data);
			setResults(data);
		} catch (e) {
			const code = e instanceof Error ? e.message : String(e);
			let errorMSG = t("addressCheck.defaultError");
			switch (code) {
				case "noResult":
					errorMSG = t("addressCheck.errorNoAddressFound");
					break;
				case "noHouseNumber":
					errorMSG = t("addressCheck.pleaseAddHouseNumber");
					break;
				case "invalidAddress":
					errorMSG = t("addressCheck.invalidAddress");
					break;
				default:
					break;
			}
			setError(errorMSG);
			setResults([]);
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
				fetchData(value, undefined, undefined);
			}, 1000);
		}
	};

	useEffect(() => {
		if (currentUserAddress) {
			setValue("addresse", currentUserAddress.name);
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
						<LocationButton
							coordinatesChanged={(lat, lon) => fetchData("", lat, lon)}
						/>
						{results.length > 0 && !showLoading && (
							<div className="flex flex-col gap-2 px-4 pb-4 pt-8">
								<strong>{t("addressCheck.result")}</strong>
								<ul className="list-disc ps-6 [&>li::marker]:text-[var(--primary)]">
									<>
										{results.map((result, index) => {
											if (
												results.some((res) => res.hasHousenumber) &&
												!result.hasHousenumber
											) {
												return null;
											}
											return (
												<li key={index}>
													{result.hasHousenumber ? (
														<Button
															onClick={() => {
																setError("");
																setValue("addresse", result.name);
																setCurrentUserAddress(result);
																setResults([]);
															}}
															variant="link"
														>
															{result.name}
														</Button>
													) : (
														<div className="flex min-h-[43px] items-center">
															<p>{result.name}</p>
														</div>
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
					</div>
				</form>
			</Form>
		</FormWrapper>
	);
}
