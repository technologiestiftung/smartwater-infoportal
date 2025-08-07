"use client";
import {
	Button,
	Form,
	FormFieldWrapper,
	FormWrapper,
	Label,
} from "berlin-ui-library";
import { FormProperty } from "berlin-ui-library/dist/elements/FormWrapper/FormFieldWrapper";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import useStore from "@/store/defaultStore";
import { getAddressResults } from "@/server/actions/getAddressResults";

interface AddressSearchProps {
	onLandingPage?: boolean;
	onAddressConfirmed?: () => void;
}

export default function AddressSearch({
	onLandingPage,
	onAddressConfirmed,
}: AddressSearchProps) {
	const t = useTranslations("home");
	const router = useRouter();

	const setCurrentUserAddress = useStore(
		(state) => state.setCurrentUserAddress,
	);

	const currentUserAddress = useStore((state) => state.currentUserAddress);
	const isLoadingLocationData = useStore((state) => state.isLoadingLocationData);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const [results, setResults] = useState<any[]>([]);
	const [error, setError] = useState<string>("");
	const methods = useForm({
		defaultValues: {
			addresse: "",
		},
	});
	const { setValue, getValues, reset } = methods;
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
				// Find the matching result from the search results
				const selectedResult = results.find(
					(result) => result.display_name === addresse,
				);
				if (selectedResult) {
					setCurrentUserAddress(selectedResult);
				}
				reset();
				if (onLandingPage) {
					router.push("/wasser-check");
				} else if (onAddressConfirmed) {
					onAddressConfirmed();
				}
			} else {
				setError("Bitte geben Sie eine Adresse ein.");
			}
		});
	};

	const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isFetching = useRef(false);

	const fetchData = async (search: string) => {
		if (isFetching.current) {
			return;
		}
		isFetching.current = true;

		try {
			const data = await getAddressResults(search);

			if (data?.error) {
				setError(data.error);
				return;
			}

			const seen = new Set();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const collectResults = data.filter((item: any) => {
				if (seen.has(item.display_name)) {
					return false;
				}
				seen.add(item.display_name);
				return true;
			});

			setResults(collectResults);
		} catch (e) {
			throw new Error(`Error fetching data: ${e}`);
		} finally {
			isFetching.current = false;
		}
	};

	const handleChange = (e: FormEvent<HTMLFormElement>) => {
		const target = e.target as HTMLInputElement;

		if (target.name === "addresse") {
			const value = target.value;

			if (value.length < 3) {
				setResults([]);
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
			setValue("addresse", currentUserAddress.display_name);
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
						{results.length > 0 && (
							<div className="flex cursor-pointer flex-col gap-2 p-4">
								<strong>Ergebnisse</strong>
								<ul className="list-disc ps-6 [&>li::marker]:text-[var(--primary)]">
									<>
										{results.map((result, index) => (
											<li key={index}>
												<Button
													onClick={() => {
														setValue("addresse", result.display_name);
														setCurrentUserAddress(result);
														setResults([]);
													}}
													variant="link"
												>
													{result?.display_name}
												</Button>
											</li>
										))}
									</>
								</ul>
							</div>
						)}
					</div>
					<Button
						className="w-full justify-end self-start lg:w-fit"
						type="submit"
						disabled={isLoadingLocationData}
					>
						{(() => {
							if (isLoadingLocationData) {
								return t("addressCheck.loading");
							}
							if (onLandingPage) {
								return t("addressCheck.button");
							}
							return t("addressCheck.buttonConfirm");
						})()}
					</Button>
					{error && (
						<Label className="text-destructive text-primary">{error}</Label>
					)}
				</form>
			</Form>
		</FormWrapper>
	);
}
