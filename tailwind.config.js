/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xxs: "360px",
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      colors: {
        primary: "#0096B5",
        secondary: "#CFD1D4",
        info: "#364574",
        success: "#00AF8F",
        danger: "#F06548",
        warning: "#F7B84B",
        successDark: "#00846E",
        dangerDark: "#c93f23",
        primaryLight: "#EAF1FE",
        secondaryDark: "#7a7979",
        secondaryLight: "#F3F6F9",
        secondaryLightest: "#f3f7f7",
        infoLight: "#ECEDF3",
        successLight: "#E6F7F5",
        dangerLight: "#FDEFEC",
        warningLight: "#FEF8ED",
        searchBg: "#EAF1FE",
      },
      backgroundImage: {
        "login-background":
          "linear-gradient(150deg, rgba(0,150,181,1) 15%, rgba(235,241,250,1) 100%)",
        "landing-page-banner": "url('./images/landing-page-banner.png')",
      },

      fontFamily: {
        workSans: ["Work Sans", ...defaultTheme.fontFamily.sans],
      },
      flexBasis: {
        "1/7": "14.2857143%",
        "2/7": "28.5714286%",
        "3/7": "42.8571429%",
        "4/7": "57.1428571%",
        "5/7": "71.4285714%",
        "6/7": "85.7142857%",
        "1/1": "100%",
      },
      width: {
        "1/7": "14.2857143%",
        "2/7": "28.5714286%",
        "3/7": "42.8571429%",
        "4/7": "57.1428571%",
        "5/7": "71.4285714%",
        "6/7": "85.7142857%",
        "1/1": "100%",
      },
    },
  },
  plugins: [],
};
