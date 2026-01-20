type SearchTestCase = {
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
		query: "euref-campus 12",
		expectedMinResults: 1,
	},
	{
		query: "Insel der Jugend",
		expectedErrorCode: "noResult",
	},
	{
		query: "Nalepastraße 18",
		expectedMinResults: 1,
	},
	{
		query: "Weg 3",
		expectedMinResults: 1,
	},
	{
		query: "Weg 3",
		expectedMinResults: 1,
	},
	{
		query: "europa park",
		expectedErrorCode: "noResult",
	},
	{
		query: "Kühnemannstraße 52",
		expectedMinResults: 1,
	},
	{
		query: "Europaplatz 1",
		expectedMinResults: 1,
	},
	{
		query: "Bayerischer Pl. 4",
		expectedMinResults: 1,
	},
	{
		query: "Scharnhorststraße 34-37",
		expectedMinResults: 1,
	},
	{
		query: "Grunewaldstraße 61-62",
		expectedMinResults: 1,
	},
	{
		query: "Lorem Ipsum",
		expectedErrorCode: "noResult",
	},
	{
		query: "Hello World 21",
		expectedErrorCode: "noResult",
	},
	{
		query: "europa",
		expectedErrorCode: "noResult",
	},
	{
		query: "brandenbrudgische straße",
		expectedErrorCode: "noResult",
	},
	{
		query: "brandenbrudgische straße 21",
		expectedErrorCode: "noResult",
	},
	{
		query: "bacharacher straße 21",
		expectedMinResults: 1,
	},
	{
		lat: 52.48852579852866,
		lon: 13.35961522154832,
		expectedResult: "Helmstraße 3, 10827 Berlin",
	},
] as const;
