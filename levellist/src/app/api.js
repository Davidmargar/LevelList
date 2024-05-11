import axios from 'axios';

export async function fetchAccessToken() {
  try {
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token?client_id=4k8jd24bztopbnifb92juh3ktfw92a&client_secret=cpszc31vdo4064yv7kfsrv6yvipbz1&grant_type=client_credentials');
    return tokenResponse.data.access_token;
  } catch (error) {
    console.log('Error al recibir el token:', error);
    throw error;
  }
}

export async function fetchGamesData(accessToken) {
  try {
    const data = 'fields *; search "zelda";';
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: '/games',
      headers: {
        'Client-ID': '4k8jd24bztopbnifb92juh3ktfw92a',
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'text/plain'
      },
      data: data
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.log('Error al obtener los datos de los juegos:', error);
    throw error;
  }
}

export async function fetchGameCovers(accessToken,ID) {
  try {
    const idString = ID.toString();
    const data = `fields url; where game = '${idString}';`;
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: '/covers',
      headers: {
        'Accept': 'application/json',
        'Client-ID': '4k8jd24bztopbnifb92juh3ktfw92a',
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'text/plain'
      },
      data: data
    };

    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.log('Error al obtener los datos de los juegos:', error);
    throw error;
  }
}
