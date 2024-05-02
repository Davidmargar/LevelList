'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    // Función para cargar juegos desde la API de IGDB
    const loadGames = async () => {
        const token = await axios.post('https://id.twitch.tv/oauth2/token?client_id=4k8jd24bztopbnifb92juh3ktfw92a&client_secret=cpszc31vdo4064yv7kfsrv6yvipbz1&grant_type=client_credentials');
        console.log(token.data.access_token);
      try {
        const response = await axios.post(
          'https://api.igdb.com/v4/games',
          {
            // Aquí especificas los campos que deseas recuperar
            fields: '*;',
            // Puedes agregar otros filtros, ordenamientos, etc. según lo necesites
            // Ejemplo: where: 'platforms = 48;'
          },
          {
            headers: {
              'Client-ID': '4k8jd24bztopbnifb92juh3ktfw92a', // Reemplaza con tu ID de cliente
              'Authorization': `bearer ${token.data.access_token}` // Reemplaza con tu token de acceso
            }
          }
        );
        setGames(response.data);
      } catch (error) {
        console.error('Error al cargar juegos:', error);
      }
    };

    loadGames();
  }, []);

  const handleGameSelect = (game: Game) => {
    setSelectedGame(game);
  };

  const handleRatingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRating(parseInt(event.target.value));
  };

  const handleAddToCollection = () => {
    // Aquí puedes guardar el juego seleccionado y su puntuación en la colección del usuario
    console.log('Añadir a la colección:', selectedGame, 'con puntuación:', rating);
  };

  return (
    <div>
      <h1>Game Collection</h1>
      <ul>
        {games.map((game) => (
          <li key={game.id} onClick={() => handleGameSelect(game)}>
            {game.name}
          </li>
        ))}
      </ul>
      {selectedGame && (
        <div>
          <h2>{selectedGame.name}</h2>
          <img src={selectedGame.cover.url} alt={selectedGame.name} />
          <label>
            Rating:
            <input type="number" min="1" max="10" value={rating} onChange={handleRatingChange} />
          </label>
          <button onClick={handleAddToCollection}>Add to Collection</button>
        </div>
      )}
    </div>
  );
};

export default GameCollection;
