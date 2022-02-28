const fs = require("fs");

const axios = require("axios");
const capitalize = require("capitalize");

class Busquedas {
  historial = [];
  dbPath = "./db/database.json";

  constructor() {
    this.leerDB();
  }

  get historialCapitalizado() {
    return this.historial.map((l) => {
      return capitalize.words(l);
    });
  }

  get paramMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
    };
  }

  get paramWeatherData() {
    return {
      units: "metric",
      appid: process.env.OPENWHATHER_KEY,
    };
  }

  async ciudad(lugar = "") {
    //Petición Http
    try {
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/`,
        params: this.paramMapbox,
      });

      const resp = await instance.get(`${lugar}.json`);

      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
    } catch (error) {}
  }

  async climaLugar(lat, lon) {
    try {
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.paramWeatherData, lat, lon },
      });

      const resp = await instance.get();
      return {
        temp: resp.data.main.temp,
        min: resp.data.main.temp_min,
        max: resp.data.main.temp_max,
        desc: resp.data.weather[0].description,
      };
    } catch (error) {
      console.log(error);
    }
  }

  agregarHistorial(lugar = "") {
    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    }

    this.historial = this.historial.splice(0, 5);
    this.historial.unshift(lugar.toLocaleLowerCase());

    this.guardarDB();
  }

  guardarDB() {
    const payload = {
      historial: this.historial,
    };
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerDB() {
    if (!fs.existsSync(this.dbPath)) {
      return;
    }

    const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });
    if (!info) {
      return;
    }

    const data = JSON.parse(info);
    this.historial = data.historial;
  }
}

module.exports = Busquedas;
