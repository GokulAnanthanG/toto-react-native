/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily:{
        DarumadropOneRegular:["DarumadropOneRegular"],
        PoppinsRegular:["PoppinsRegular"],
        PoppinsBold:["PoppinsBold"],
        PoppinsMedium:["PoppinsMedium"],
      }
    },
  },
  plugins: [],
}