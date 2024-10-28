/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	safelist: [
		{
			pattern:
				/bg-(red|green|blue|yellow|orange|purple|sky|emerald|amber|violet)-(100|400|500|600)/, variants: ['hover', 'dark']
		},
		{
			pattern:
				/text-(red|green|blue|yellow|orange|purple|sky|emerald|amber|violet)-(100|200|400|500)/, variants: ['hover', 'dark']
		},
    {
			pattern:
				/border-(red|green|blue|yellow|orange|purple|sky|emerald|amber|violet)-(100|400|500)/, variants: ['hover']
		},
	],
	theme: {
		extend: {},
	},
	plugins: [],
};
