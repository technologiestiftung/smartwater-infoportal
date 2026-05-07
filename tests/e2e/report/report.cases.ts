export const reportCases = [
	{
		query:
			"HouseOwner with Windows, low value, no information about basement, good backflowProtection condition, no flood experience",
		address: "Grunewaldstraße 61-62",
		answers: {
			q0: "houseOwner",
			q1: "yesWithWindow",
			q2: "lowValue",
			q3: "noInformation",
			q4: "good",
			q5: "no",
		},
	},
	{
		query:
			"FlatOwner with Windows, low value, no information about basement, good backflowProtection condition, no flood experience",
		address: "Grunewaldstraße 61-62",
		answers: {
			q0: "flatOwner",
			q1: "yesWithoutWindow",
			q2: "lowValue",
			q3: "noInformation",
			q4: "good",
			q5: "no",
		},
	},
	{
		query:
			"Rent with no Windows, no Info on value, no information about basement, good backflowProtection condition, no flood experience",
		address: "Grunewaldstraße 61-62",
		answers: {
			q0: "rent",
			q1: "yesWithoutWindow",
			q2: "noInformation",
			q3: "yesUnknown",
			q4: "bad",
			q5: "no",
		},
	},
	{
		query:
			"Rent with no Windows, low value, no information about basement, good backflowProtection condition, no flood experience",
		address: "Grunewaldstraße 61-62",
		answers: {
			q0: "rent",
			q1: "no",
			q3: "yesUnknown",
			q4: "bad",
			q5: "no",
		},
	},
	{
		query: "Skipped Questionnaire",
		address: "Grunewaldstraße 61-62",
		skip: "true",
	},
	{
		query:
			"Address with high flood risk but skipped questionnaire (Majakowskiring 7)",
		address: "Majakowskiring 7",
		skip: "true",
	},
	{
		query:
			"Address with high flood risk but skipped questionnaire (Brandensteinweg 31)",
		address: "Brandensteinweg 31",
		skip: "true",
	},
	{
		query:
			"Address with high flood risk but skipped questionnaire (Spandauer Burgwall 40)",
		address: "Spandauer Burgwall 40",
		skip: "true",
	},
	{
		query: "Address in Starkregen-Gefahrenkarte (Arminiusstraße 2-4)",
		address: "Arminiusstraße 2-4",
		skip: "true",
	},
	{
		query: "Address in Starkregen-Gefahrenkarte (Lübener Weg 24C)",
		address: "Lübener Weg 24C",
		skip: "true",
	},
];
