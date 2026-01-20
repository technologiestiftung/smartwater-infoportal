type SearchTestCase = {
	kind: "forward" | "reverse";
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
		query: "euref-campus 12",
		expectedMinResults: 1,
	},
	{
		kind: "forward",
		query: "Insel der Jugend",
		expectedErrorCode: "noResult",
	},
	{
		kind: "forward",
		query: "Nalepastraße 18",
		expectedMinResults: 1,
	},
	{
		kind: "forward",
		query: "Weg 3",
		expectedMinResults: 1,
	},
	{
		kind: "forward",
		query: "Weg 3",
		expectedMinResults: 1,
	},
	{
		kind: "forward",
		query: "europa park",
		expectedErrorCode: "noResult",
	},
	{
		kind: "forward",
		query: "Kühnemannstraße 52",
		expectedMinResults: 1,
	},
	{
		kind: "forward",
		query: "Europaplatz 1",
		expectedMinResults: 1,
	},
	{
		kind: "forward",
		query: "Bayerischer Pl. 4",
		expectedMinResults: 1,
	},
	{
		kind: "forward",
		query: "Scharnhorststraße 34-37",
		expectedMinResults: 1,
	},
	{
		kind: "forward",
		query: "Grunewaldstraße 61-62",
		expectedMinResults: 1,
	},
	{
		kind: "forward",
		query: "Lorem Ipsum",
		expectedErrorCode: "noResult",
	},
	{
		kind: "forward",
		query: "Hello World 21",
		expectedErrorCode: "noResult",
	},
	{
		kind: "forward",
		query: "europa",
		expectedErrorCode: "noResult",
	},
	{
		kind: "forward",
		query: "brandenbrudgische straße",
		expectedErrorCode: "noResult",
	},
	{
		kind: "forward",
		query: "brandenbrudgische straße 21",
		expectedErrorCode: "noResult",
	},
	{
		kind: "forward",
		query: "bacharacher straße 21",
		expectedMinResults: 1,
	},
	{
		kind: "reverse",
		lat: 52.48852579852866,
		lon: 13.35961522154832,
		expectedResult: "Helmstraße 3, 10827 Berlin",
	},
] as const;
