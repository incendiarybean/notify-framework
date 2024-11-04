/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	safelist: [
		{
			pattern:
				/bg-(red|green|blue|yellow|orange|purple|sky|emerald|amber|violet)-(400|500|600)/, variants: ['hover', 'dark', 'focus']
		},
		{
			pattern:
				/text-(red|green|blue|yellow|orange|purple|sky|emerald|amber|violet)-(100|300|400|500|600)/, variants: ['hover', 'dark', 'focus']
		},
    {
			pattern:
				/border-(red|green|blue|yellow|orange|purple|sky|emerald|amber|violet)-(400|500)/, variants: ['dark']
		},
	],
	theme: {
		extend: {},
	},
	plugins: [],
};
