'use client';
import React, { useState, useEffect } from 'react'
import { fetchAccessToken, fetchGamesData, fetchGameCovers} from '../api'

interface Game {
  id: number;
  name: string;
  cover: {
    url: string;
  };
}

const GameCollection: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [ratings, setRatings] = useState<{[key: number]: number}>({});
  const [portada, setPortada] = useState<any>();

  useEffect(() => {
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
    const loadPortadas = async () => {
      try {
        const accessToken = await fetchAccessToken();
        const portadasPromises = games.map(async (game) => {
          const portada = await fetchGameCovers(accessToken, game.id);
          return { gameId: game.id, portada };
        });
        const portadas = await Promise.all(portadasPromises);
        setPortada(portadas);
        console.log(portadas)
      } catch (error) {
        console.log('Error al cargar las portadas:', error);
      }
    };
  
    if (games.length > 0 && !portada) {
      loadPortadas();
    }
  }, [games]);

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
  };

  const handleStarClick = (ratingValue: number) => {
    setRatings({...ratings, [selectedGame!.id]: ratingValue});
  };

  const handleAddToCollection = () => {
    if(ratings[selectedGame.id]) {
      console.log('Añadir a la colección:', selectedGame, 'con puntuación:', ratings[selectedGame.id]);
    } else {
      console.log('Error: No has puntuado el juego.')
    }
  };

  return (
  <div className="mx-4">
    <h2 className="text-4xl font-extrabold dark:text-white ml-2">Juegos populares</h2>
    <ul className='ml-10 mt-4 flex flex-wrap'>
      {games.map((game) => (
        <li key={game.id} onClick={() => handleGameSelect(game)} className="ml-4 mt-4 w-72">
          <div className="w-full">
            <img src={portada && portada.length > 0 ? portada.find(p => p.gameId === game.id)?.portada[0]?.url : ''} alt={game.name}/>
            <span className="whitespace-normal">{game.name}</span>
            {selectedGame && selectedGame.id === game.id && (
              <div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className={`w-4 h-4 text-${star <= ratings[game.id] ? 'yellow' : 'gray'}-300 me-1 cursor-pointer`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20" onClick={() => handleStarClick(star)}>
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                    </svg>
                  ))}
                  <p className="ms-1 text-sm font-medium text-gray-300 dark:text-gray-200">{ratings[game.id]}</p>
                  <p className="ms-1 text-sm font-medium text-gray-300 dark:text-gray-200">de</p>
                  <p className="ms-1 text-sm font-medium text-gray-300 dark:text-gray-200">5</p>
                </div>
                <button
                type="button" 
                className="mt-2 text-gray-800 bg-gray-300 hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2"
                onClick={handleAddToCollection}>
                
                  <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M9 8h10M9 12h10M9 16h10M4.99 8H5m-.02 4h.01m0 4H5"/>
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