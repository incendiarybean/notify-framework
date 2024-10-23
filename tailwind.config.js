/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	safelist: [
		{
			pattern:
				/bg-(red|green|blue|yellow|orange|purple|sky|emerald|amber|voilet)-(100|400|500)/, variants: ['hover']
		},
		{
			pattern:
				/text-(red|green|blue|yellow|orange|purple|sky|emerald|amber|voilet)-(100|400|500)/, variants: ['hover']
		},
    {
			pattern:
				/border-(red|green|blue|yellow|orange|purple|sky|emerald|amber|voilet)-(100|400|500)/, variants: ['hover']
		},
	],
	theme: {
		extend: {},
	},
	plugins: [],
};
