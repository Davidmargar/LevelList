'use client'
import React, { useState, useEffect } from 'react';
import { fetchAccessToken, fetchGamesData, fetchGameCovers, fetchJuego } from '../api';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

interface Game {
  id: number;
  name: string;
  cover: {
    url: string;
  };
}

const firebaseConfig = {
  apiKey: "AIzaSyBaEgrHEOgZCNYk9GnOd7ZcDjTs4MFCLxs",
  authDomain: "levellist.firebaseapp.com",
  projectId: "levellist",
  storageBucket: "levellist.appspot.com",
  messagingSenderId: "556130227404",
  appId: "1:556130227404:web:3d93eb543d06d8acc5de69",
  measurementId: "G-QZCVZLK76S"
};

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const GameCollection: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});
  const [portada, setPortada] = useState<any[] | null>(null);
  const [buscarJuego, setBuscarJuego] = useState('')
  const [juegoBuscado, setJuegoBuscado] = useState<Game>();
  const [portadaBuscado, setPortadaBuscado] = useState<string | null>(null);
  const [resena, setResena] = useState('')

  useEffect(() => {
    //Busca los juegos populares de IGDB.
    const loadData = async () => {
      try {
        const accessToken = await fetchAccessToken();
        const gamesData = await fetchGamesData(accessToken);
        setGames(gamesData);
      } catch (error) {
        console.log('Error al cargar los datos:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    //Busca las portadas de los juegos encontrados anteriormente en IGDB.
    const loadPortadas = async () => {
      try {
        const accessToken = await fetchAccessToken();
        // Dividimos los juegos en chunks de 2 para no petar IGDB a peticiones.
        const chunkedGames = [];
        for (let i = 0; i < games.length; i += 2) {
          chunkedGames.push(games.slice(i, i + 2));
        }

        const portadas = [];
        for (const chunk of chunkedGames) {
          const portadasPromises = chunk.map(async (game) => {
            const portada = await fetchGameCovers(accessToken, game.id);
            return { gameId: game.id, portada };
          });

          //Esperamos a que se completen todas las peticiones de portadas, y añadimos todo de golpe.
          const chunkPortadas = await Promise.all(portadasPromises);
          portadas.push(...chunkPortadas);
        }

        //Modificacion para que el tamaño de las portadas no sea enano.
        const modifyPortadas = async () => {
          for (let thumb of portadas) {
            if (thumb.portada[0].url) {
              thumb.portada[0].url = thumb.portada[0].url.replace("t_thumb", "t_cover_small_2x");
            }
          }
        };
        
        await modifyPortadas();
        setPortada(portadas);

      } catch (error) {
        console.log('Error al cargar las portadas:', error);
      }
    };

    //Si tenemos los juegos y no tenemos las portadas, ejecutamos.
    if (games.length > 0 && !portada) {
      loadPortadas();
    }
  }, [games, portada]);

  //Buscar juegos en IGDB, por nombre.
  const buscar = async () => {  
    try {
      setPortadaBuscado(null);
      setJuegoBuscado(undefined);
      const accessToken = await fetchAccessToken();
      const juegoABuscar = buscarJuego.trim();
      const gamesData = await fetchJuego(accessToken, juegoABuscar);
      
      //Si se ha encontrado juego, buscamos la portada.
      if (gamesData.length > 0) {
        const juegoEncontrado = gamesData[0];
        setJuegoBuscado(juegoEncontrado);
        
        const portadas = await fetchGameCovers(accessToken, juegoEncontrado.id);
        if (portadas.length > 0) {
          const portada = portadas[0].url.replace("t_thumb", "t_cover_small_2x");
          setPortadaBuscado(portada);
        } else {
          setPortadaBuscado(null);
        }
      } else {
        // Si no se encontró el juego, limpia la portada
        setPortadaBuscado(null);
      }
    } catch (error) {
      console.log('Error al buscar el juego:', error);
    }
  };

  const handleGameSelect = (game: Game) => {
    setResena('')
    setSelectedGame(game);
  };

  const handleStarClick = (ratingValue: number) => {
    setRatings({ ...ratings, [selectedGame!.id]: ratingValue });
  };

  const handleBuscarJuego = (event: any) => {
    setResena('')
    setBuscarJuego(event.target.value);
  };

  const handleResena = (event: any) => {
    setResena(event.target.value)
  };

  //Añadir juegos a la colección.
  const handleAddToCollection = async () => {
    if (ratings[selectedGame!.id]) {
      console.log('Añadir a la colección:', selectedGame, 'con puntuación:', ratings[selectedGame!.id]);
      try {
        const docRef = await addDoc(collection(db, "Resenas"), {
          nota: ratings[selectedGame!.id],
          ID: selectedGame?.id,
          cover: selectedGame?.cover,
          Nombre: selectedGame?.name,
          resena: resena,
          user: localStorage.getItem('user')
        });
        console.log("Añadido a la BD con el ID: ", docRef.id);
      } catch (e) {
        console.error("Error al añadir el documento a la BD: ", e);
      }
    } else {
      console.log('Error: No has puntuado el juego.');
    }
  };

  if (!portada) {
    return <div className="text-center">
      <div role="status">
          <svg aria-hidden="true" className="mt-10 inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
          <span className="sr-only">Cargando...</span>
      </div>
    </div>;
  }

  return (
    <div className="mx-4">
      <h2 className="text-4xl font-extrabold dark:text-white ml-2">Busca un juego:</h2>
      {portadaBuscado && (
        <div className="ml-12 mt-4 w-72" onClick={() => handleGameSelect(juegoBuscado)}>
        <div className="w-full">
          <img src={portadaBuscado || ''} alt={juegoBuscado.name} />
          <span className="whitespace-normal">{juegoBuscado.name}</span>
        </div>
        {selectedGame && selectedGame.id === juegoBuscado.id && (
                <div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 text-${star <= ratings[juegoBuscado.id] ? 'yellow' : 'gray'}-300 me-1 cursor-pointer`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 22 20"
                        onClick={() => handleStarClick(star)}
                      >
                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                      </svg>
                    ))}
                    <p className="ms-1 text-sm font-medium text-gray-300 dark:text-gray-200">{ratings[juegoBuscado.id]}</p>
                    <p className="ms-1 text-sm font-medium text-gray-300 dark:text-gray-200">de</p>
                    <p className="ms-1 text-sm font-medium text-gray-300 dark:text-gray-200">5</p>
                  </div>
                  <textarea
                      id="message"
                      rows={4}
                      className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Escribe aquí tu reseña."
                      value={resena}
                      onChange={handleResena}
                  />
                  <button
                    type="button"
                    className="mt-2 text-gray-800 bg-gray-300 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2"
                    onClick={handleAddToCollection}
                  >
                    <svg
                      className="w-6 h-6 text-gray-800 dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M9 8h10M9 12h10M9 16h10M4.99 8H5m-.02 4h.01m0 4H5" />
                    </svg>
                    Añadir a la colección
                  </button>
                </div>
              )}
      </div>
      )}
      <form className="ml-12 mx-4" onSubmit={(e) => {
        e.preventDefault(); // Evita el comportamiento predeterminado del formulario
        buscar(); // Llama a la función buscar cuando se envía el formulario
      }}>
        <div className="mb-5 flex">
          <input
            type="text"
            id="buscarJuego"
            className="mt-4 shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 flex p-2.5"
            placeholder="Elden Ring"
            value={buscarJuego}
            onChange={handleBuscarJuego}
            required
          />
          <button
            type="submit"
            className=" mt-4 text-white bg-gray-300 hover:bg-gray-400 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center ml-2"
          >
            <svg
              className="w-6 h-6 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
                d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
              />
            </svg>
          </button>
        </div>
      </form>
      <h2 className="text-4xl font-extrabold dark:text-white ml-2">Juegos populares</h2>
      <ul className="ml-10 mt-4 flex flex-wrap">
        {games.map((game) => (
          <li key={game.id} onClick={() => handleGameSelect(game)} className="ml-4 mt-4 w-72">
            <div className="w-full">
              <img src={portada.find((p) => p.gameId === game.id)?.portada[0]?.url || ''} alt={game.name} />
              <span className="whitespace-normal">{game.name}</span>
              {selectedGame && selectedGame.id === game.id && (
                <div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 text-${star <= ratings[game.id] ? 'yellow' : 'gray'}-300 me-1 cursor-pointer`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 22 20"
                        onClick={() => handleStarClick(star)}
                      >
                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                      </svg>
                    ))}
                    <p className="ms-1 text-sm font-medium text-gray-300 dark:text-gray-200">{ratings[game.id]}</p>
                    <p className="ms-1 text-sm font-medium text-gray-300 dark:text-gray-200">de</p>
                    <p className="ms-1 text-sm font-medium text-gray-300 dark:text-gray-200">5</p>
                  </div>
                  <textarea
                      id="message"
                      rows={4}
                      className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Escribe aquí tu reseña."
                      value={resena}
                      onChange={handleResena}
                  />
                  <button
                    type="button"
                    className="mt-2 text-gray-800 bg-gray-300 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2"
                    onClick={handleAddToCollection}
                  >
                    <svg
                      className="w-6 h-6 text-gray-800 dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M9 8h10M9 12h10M9 16h10M4.99 8H5m-.02 4h.01m0 4H5" />
                    </svg>
                    Añadir a la colección
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameCollection;
