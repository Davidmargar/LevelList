'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { addDoc, collection, deleteDoc, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL, getMetadata, StorageReference } from 'firebase/storage';
import { fetchAccessToken, fetchGameCovers } from '../api';
import router, { useRouter } from 'next/navigation';

interface Review {
  id: string;
  ID: number;
  Nombre: string;
  cover: number;
  nota: number;
  resena: string;
  user: string;
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export default function Detalle() {
  const [imageUrl, setImageUrl] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [portada, setPortada] = useState<{ [id: string]: string }>({});
  const [cargando, setCargando] = useState<Boolean>(true)
  const [userDetalle, setUserDetalle] = useState('')
  const [following, setFollowing] = useState<Boolean>(false)
  const [docBD, setDocBD] = useState<any>()



  useEffect(() => {
    // Seteamos el usuario
    setUserId(localStorage.getItem('user'))

    // Obtenemos el usuario del que sacar detalle desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const usuarioParam = urlParams.get('usuario');

    if (usuarioParam) {
      setUserDetalle(usuarioParam);
    }

  }, []);

  const isFollowing = useCallback(async () => {
    try {
      if (userDetalle && userId) {
        console.log('userDetalle: ', userDetalle);
        console.log('userId: ', userId);
        const q = query(
          collection(db, 'Usuarios'),
          where('follows', '==', userDetalle),
          where('user', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        console.log(querySnapshot);
  
        if (!querySnapshot.empty) {
          setDocBD(querySnapshot);
          setFollowing(true);
        }
      }
    } catch (error) {
      console.error('Error al comprobar el follow:', error);
    }
  }, [userDetalle, userId]);
  
  useEffect(() => {
    // Llama a isFollowing al cargar la página
    isFollowing();
  }, [isFollowing]);

  useEffect(() => {
    // Obtener las reseñas del usuario actual
    const fetchReviews = async () => {
      try {
        const q = query(collection(db, 'Resenas'), where('user', '==', userDetalle));
        const querySnapshot = await getDocs(q);

        const reviewsData: Review[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        setReviews(reviewsData);

        //Buscamos en IGDB las portadas de los juegos de los que hay reseña.
        const accessToken = await fetchAccessToken();
        reviewsData.forEach(async (review) => {
          try {
            const portada = await fetchGameCovers(accessToken, review.ID);
            if (portada.length > 0) {
              const portadaFinal = portada[0].url.replace("t_thumb", "t_cover_small");

              setPortada(prevPortada => ({
                ...prevPortada,
                [review.id]: portadaFinal
              }));
            }
          } catch (error) {
            console.error('Error al obtener la portada del juego:', error);
          }
        });
        setCargando(false)
      } catch (error) {
        console.error('Error al obtener las reseñas del usuario:', error);
      }
    };

    if (userDetalle) {
      fetchReviews();
    }
  }, [userDetalle]);

  useEffect(() => {
    //Imagen por defecto, si no hay imagen de perfil para el usuario.
    const dummy = ref(storage, 'dummy.png');
    if (!userDetalle) return;

    //Buscamos en Firebase Storage si hay imagen de usuario, si la hay, la usamos.
    const profileImg = ref(storage, `${userDetalle}.png`);
    const checkImageExists = async (imageRef: StorageReference) => {
      try {
        await getMetadata(imageRef);
        return true;
      } catch (error) {
        if (error.code === 'storage/object-not-found') {
          return false;
        } else {
          console.error("Error al comprobar la existencia de la imagen: ", error);
          return false;
        }
      }
    };

    //Descarga la imagen del storage.
    const getImageUrl = async (imageRef: StorageReference) => {
      try {
        const exists = await checkImageExists(imageRef);
        return exists ? getDownloadURL(imageRef) : getDownloadURL(dummy);
      } catch (error) {
        console.error("Error al obtener URL de la imagen: ", error);
        return null;
      }
    };

    getImageUrl(profileImg)
      .then((url) => {
        if (url) {
          setImageUrl(url);
        }
      });

  }, [userDetalle])

  const followUser = async () => {
    try {
      const docRef = await addDoc(collection(db, "Usuarios"), {
        user: localStorage.getItem('user'),
        follows: userDetalle
      });
      console.log("Añadido a la BD con el ID: ", docRef.id);
      isFollowing()
    } catch (e) {
      console.error("Error al añadir el documento a la BD: ", e);
    }
  }

  const unfollowUser = async () => {
    try {

      if (!docBD.empty) {
        await deleteDoc(docBD.docs[0].ref);

        console.log('Has dado unfollow');
        setFollowing(false)
      } else {
        console.log('No se ha encontrado documento.');
      }
      
    } catch (e) {
      console.error("Error al añadir el documento a la BD: ", e);
    }
  }

  if (cargando) {
    return <div className="text-center">
      <div role="status">
        <svg aria-hidden="true" className="mt-10 inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
        </svg>
        <span className="sr-only">Cargando...</span>
      </div>
    </div>;
  }

  return (
    <div>
      <div className='flex items-center ml-4'>
        {imageUrl ? (
          <img className="square-full rounded-lg w-32 h-32 ml-12 mt-12" src={imageUrl} alt="imagen de perfil" />
        ) : (
          <div className="loader"></div>
        )}
        <h2 className="text-4xl font-extrabold dark:text-white ml-4" style={{ marginTop: '140px' }}>{userDetalle}</h2>
        <div>
          {!following && (
            <button
              type="button"
              style={{ marginTop: '140px' }}
              className="ml-4 text-center inline-flex items-center bg-gray-500 hover:bg-gray-300 hover:text-gray-700 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 sm:mb-0 focus:outline-none"
              onClick={followUser}
            >
              <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M9 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H7Zm8-1a1 1 0 0 1 1-1h1v-1a1 1 0 1 1 2 0v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 0 1-1-1Z" clipRule="evenodd" />
              </svg>
              <p className='ml-2'>Seguir a este usuario</p>
            </button>
          )}

          {following && (
            <button
              type="button"
              style={{ marginTop: '140px' }}
              className="ml-4 text-center inline-flex items-center bg-red-500 hover:bg-red-300 hover:text-gray-700 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 sm:mb-0 focus:outline-none"
              onClick={unfollowUser}
            >
              <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M5 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0Zm-2 9a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1Zm13-6a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-4Z" clipRule="evenodd" />
              </svg>
              <p className='ml-2'>Dejar de seguir a este usuario</p>
            </button>
          )}
        </div>
      </div>
      <hr className="w-full h-0.5 mx-auto my-4 bg-gray-400 border-0" />
      <div>
        <h2 className="text-4xl font-extrabold dark:text-white" style={{ marginLeft: '14px' }}> Reseñas:</h2>
        <ul>
          {reviews.map(review => (
            <li key={review.id} className="ml-4 mt-4 w-90">
              <div className="flex items-center">
                {/* Mostrar la portada del juego */}
                {portada[review.id] && (
                  <img src={portada[review.id]} alt="Portada del juego" />
                )}
                <div>
                  {/* Mostrar el nombre del juego */}
                  <p className="ml-4 text-sm font-medium text-gray-300 dark:text-gray-200">{review.Nombre}</p>
                  {/* Mostrar las estrellas de calificación */}
                  <div className="ml-4 flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 text-${star <= review.nota ? 'yellow' : 'gray'}-300 me-1 cursor-pointer`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 22 20"
                      >
                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                      </svg>
                    ))}
                    <p className="text-sm font-medium text-gray-300 dark:text-gray-200">{review.nota} de 5</p>
                  </div>
                  <div className='flex items-center'>
                    <p className="ml-4 text-sm font-medium text-gray-300 dark:text-gray-200" style={{ marginTop: '30px' }}>{review.resena}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}