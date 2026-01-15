/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: The "presets" option is vital for NativeWind to work
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}

