export const searchAddressCases = [
	{
		name: "forward search with valid address",
		query: "Helmstraße 3, Berlin",
		expectedMinResults: 1,
	},
	{
		name: "reverse search in Berlin",
		lat: 52.520008,
		lon: 13.404954,
		expectedMinResults: 1,
	},
] as const;
