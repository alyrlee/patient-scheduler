/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: { 
      extend: {
        colors: {
          // Curious Blue Palette
          'curious-blue': {
            50: '#F2F8FD',
            100: '#E3F0FB',
            200: '#C1E1F6',
            300: '#8BC9EE',
            400: '#37A3DF',
            500: '#2693D1',
            600: '#1875B1',
            700: '#155E8F',
            800: '#155077',
            900: '#174363',
            950: '#0F2B42',
          },
          // Custom Grayscale Palette
          'custom-gray': {
            50: '#F8F8F8',
            100: '#EBEBEB',
            200: '#DCDCDC',
            300: '#BDBDBD',
            400: '#989898',
            500: '#7C7C7C',
            600: '#656565',
            700: '#525252',
            800: '#464646',
            900: '#3D3D3D',
            950: '#292929',
          },
          // Dark Fern Green Palette
          'fern': {
            50: '#EAFFE4',
            100: '#D0FFC5',
            200: '#A4FF92',
            300: '#6BFF53',
            400: '#37FC1F',
            500: '#15E200',
            600: '#0BB500',
            700: '#0A8902',
            800: '#0D6C08',
            900: '#0F5B0C',
            950: '#003D00',
          },
        },
        screens: {
          'xs': '475px',
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem',
        },
        minHeight: {
          '44': '44px',
        },
        fontSize: {
          '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        }
      } 
    },
    plugins: [],
  };
  