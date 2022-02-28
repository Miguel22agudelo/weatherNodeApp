require("dotenv").config();

const {
  leerInput,
  inquireMenu,
  pause,
  listarLugares,
} = require("./helpers/inquirer");
const Busquedas = require("./models/busqueda");

const main = async () => {
  let opt;
  const busquedas = new Busquedas();

  do {
    console.clear();
    opt = await inquireMenu();

    switch (opt) {
      case 1:
        const termino = await leerInput("Place: ");

        //Buscar los lugare
        const lugares = await busquedas.ciudad(termino);

        //Seleccionar el lugar
        const id = await listarLugares(lugares);
        if (id === "0") continue;
        const lugarSel = lugares.find((l) => l.id === id);

        //Guardar en DB
        busquedas.agregarHistorial(lugarSel.nombre);

        console.log("\nLoading...\n".cyan);

        const climaLugar = await busquedas.climaLugar(
          lugarSel.lat,
          lugarSel.lng
        );

        console.clear();

        console.log("\nPlace Information: \n".green);
        console.log("Place: ", lugarSel.nombre.cyan);
        console.log("Lat: ", lugarSel.lat);
        console.log("Lng: ", lugarSel.lng);
        console.log("Temperature: ", climaLugar.temp);
        console.log("Min: ", climaLugar.min);
        console.log("Max: ", climaLugar.max);
        console.log("Description: ", climaLugar.desc.cyan);

        break;

      case 2:
        busquedas.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${i + 1}. `.green;
          console.log(`${idx} ${lugar}`);
        });

        break;
      default:
        break;
    }

    if (opt !== 0) await pause();
  } while (opt !== 0);
};

main();
