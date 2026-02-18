"use client";

import { CurrentUserAddress } from "@/lib/types";
import { searchAddresses } from "@/server/actions/searchAddresses";
import useStore from "@/store/defaultStore";
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
import LocationButton from "./LocationButton";

const LocationDataNotFound = {
	found: false,
	building: null,
};

export default function AddressSearch() {
	const t = useTranslations("home");
	const router = useRouter();
	const [showLoading, setShowLoading] = useState<boolean>(false);
	const [showSubmitLoading, setShowSubmitLoading] = useState<boolean>(false);
	const isDev = process.env.NODE_ENV === "development";
	const { currentUserAddress, setCurrentUserAddress, setLocationData } =
		useStore();
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

	const testingAddresses = ["Grunewaldstraße 61", "Grunewaldstraße 62"];

	const handleSubmit = () => {
		return methods.handleSubmit(async () => {
			setShowSubmitLoading(true);
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

	const fetchData = async (
		search: string,
		lat: number | undefined,
		lon: number | undefined,
	) => {
		setShowLoading(true);
		setError("");

		const result = await searchAddresses(search, lat, lon);

		if (!result.ok) {
			let msg = t("addressCheck.defaultError");
			switch (result.code) {
				case "noResult":
					msg = t("addressCheck.errorNoAddressFound");
					break;
				default:
					break;
			}
			setError(msg);
			setLocationData(LocationDataNotFound);
			setResults([]);
			return;
		}
		console.log("result.data :>> ", result.data);
		setResults(result.data);
	};

	const handleChange = (e: FormEvent<HTMLFormElement>) => {
		const target = e.target as HTMLInputElement;
		if (resultClicked) {
			setResultClicked(false);
		}
		if (target.name === "addresse") {
			const value = target.value;

			if (value.length < 3) {
				setLocationData(LocationDataNotFound);
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
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setResultClicked(true);
		}
	}, [currentUserAddress, setValue]);

	// eslint-disable-next-line react-hooks/set-state-in-effect
	useEffect(() => setShowLoading(false), [results]);

	useEffect(() => {
		if (error) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setShowLoading(false);
			setShowSubmitLoading(false);
		}
	}, [error]);

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
						{isDev && (
							<div className="flex flex-col gap-2">
								{testingAddresses.map((address) => (
									<div
										key={address}
										className="cursor-pointer bg-black/20 p-2"
										onClick={() => {
											handleChange({
												target: { name: "addresse", value: address },
												// eslint-disable-next-line @typescript-eslint/no-explicit-any
											} as any);
										}}
									>
										<p>{address}</p>
									</div>
								))}
							</div>
						)}
						{results.length > 0 && !showLoading && (
							<div className="flex flex-col gap-2 px-4 pt-8 pb-4">
								<strong>{t("addressCheck.result")}</strong>
								<ul className="list-disc ps-6 [&>li::marker]:text-[var(--primary)]">
									<>
										{results.map((result, index) => {
											return (
												<li key={index}>
													{result.hasHousenumber ? (
														<Button
															onClick={() => {
																setError("");
																setValue("addresse", result.name);
																setCurrentUserAddress(result);
																if (result.building) {
																	setLocationData({
																		found: true,
																		building: result.building,
																	});
																}
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
						<div className="lg:max-w-[50%]">
							<Label className="text-destructive text-primary">{error}</Label>
						</div>
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
							loading={showSubmitLoading}
						>
							{t("addressCheck.button")}
						</Button>
					</div>
				</form>
			</Form>
		</FormWrapper>
	);
}
