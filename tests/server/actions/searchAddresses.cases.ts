type SearchTestCase = {
	kind: "forward" | "reverse";
	name: string;
	query?: string;
	lat?: number;
	lon?: number;
	expectedMinResults?: number;
	expectedMaxResults?: number;
	expectedResults?: number;
	expectedErrorCode?: string;
	expectedResult?: string;
};

export const searchAddressCases: SearchTestCase[] = [
	{
		kind: "forward",
		name: "Euref Campus",
		query: "euref-campus 12",
		expectedMinResults: 1,
	},
	{
		kind: "forward",
		name: "Insel der Jugend with no house number",
		query: "Insel der Jugend",
		expectedErrorCode: "noResult",
	},
	{
		kind: "forward",
		name: "Nalepastraße 18",
		query: "Nalepastraße 18",
		expectedMinResults: 1,
	},
	{
		kind: "forward",
		name: "Weg 3",
		query: "Weg 3",
		expectedMinResults: 1,
	},
	{
		kind: "forward",
		name: "Kühnemannstraße 52",
		query: "Kühnemannstraße 52",
		expectedMinResults: 1,
	},
	{
		kind: "forward",
		name: "Europaplatz 1",
		query: "Europaplatz 1",
		expectedMinResults: 1,
	},
	{
		kind: "forward",
		name: "Bayerischer Pl. 4",
		query: "Bayerischer Pl. 4",
		expectedMinResults: 1,
	},
	{
		kind: "forward",
		name: "Scharnhorststraße 34-37",
		query: "Scharnhorststraße 34-37",
		expectedMinResults: 1,
	},
	{
		kind: "forward",
		name: "Grunewaldstraße 61-62",
		query: "Grunewaldstraße 61-62",
		expectedMinResults: 1,
	},
	{
		kind: "forward",
		name: "Lorem Ipsum",
		query: "Lorem Ipsum",
		expectedErrorCode: "noResult",
	},
	{
		kind: "forward",
		name: "Hello World 21",
		query: "Hello World 21",
		expectedErrorCode: "noResult",
	},
	{
		kind: "forward",
		name: "europa",
		query: "europa",
		expectedErrorCode: "noResult",
	},
	{
		kind: "reverse",
		name: "Helmstraße 3",
		lat: 52.48852579852866,
		lon: 13.35961522154832,
		expectedResult: "Helmstraße 3, 10827 Berlin",
	},
] as const;
