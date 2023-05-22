import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'
import es from 'vuetify/lib/locale/es'

Vue.use(Vuetify)



const customDarkTheme = {
  dark: true,
  colors: {
    background: "#15202b",
    surface: "#15202b",
    primary: "#3f51b5",
    secondary: "#03dac6",
    error: "#f44336",
    info: "#2196F3",
    success: "#4caf50",
    warning: "#fb8c00",
  },
};


export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#6D2077',
        secondary: '#b0bec5',
        accent: '#8c9eff',
        error: '#b71c1c',
      },
    },
  },
})
