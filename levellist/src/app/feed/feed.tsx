'use client'
import { useState, useEffect } from 'react';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getStorage, getDownloadURL, ref } from 'firebase/storage';
import { fetchAccessToken, fetchGameCovers } from '../api';
import Link from 'next/link';

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

export default function Feed() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [portada, setPortada] = useState<{ [id: string]: string }>({});
  const [imageUrls, setImageUrls] = useState<{ [username: string]: string }>({});
  const [cargando, setCargando] = useState<boolean>(true);
  const [following, setFollowing] = useState<{ [user: string]: string }>({});
  const [reviewsSeguidores, setReviewsSeguidores] = useState<Review[]>([]);

  useEffect(() => {
    const userID = localStorage.getItem('user');

    //Busca la gente a la que seguimos
    const fetchFollowing = async () => {
      const q = query(collection(db, 'Usuarios'), where('user', '==', userID));
      const querySnapshot = await getDocs(q);
    
      const follows: { [user: string]: string } = {};
    
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const followedUser = data.follows;
        if (followedUser && !follows[followedUser]) {
          follows[followedUser] = followedUser;
        }
      });
    
      setFollowing(follows);
      console.log('Sigues a: ', following)
    
      const addedReviews = new Set();
      const tempReviewsSeguidores: Review[] = []; // Variable temporal para acumular las reseñas
    
      for (let i in follows) {
        const sql = query(collection(db, 'Resenas'), where('user', '==', follows[i]));
        const queryDos = await getDocs(sql);
        const reviewsData: Review[] = queryDos.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    
        reviewsData.forEach(review => {
          if (!addedReviews.has(review.id)) {
            addedReviews.add(review.id);
            tempReviewsSeguidores.push(review); // Agregar la reseña a la variable temporal
          }
        });
    
        const accessToken = await fetchAccessToken();
        for (const review of reviewsData) {
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
    
          if (!imageUrls[review.user]) {
            const imageRef = ref(storage, `${review.user}.png`);
            try {
              const url = await getImageUrl(imageRef);
              if (url) {
                setImageUrls(prevImageUrls => ({
                  ...prevImageUrls,
                  [review.user]: url
                }));
              }
            } catch (error) {
              const defaultImageRef = ref(storage, `dummy.png`);
              const defaultUrl = await getImageUrl(defaultImageRef);
              if (defaultUrl) {
                setImageUrls(prevImageUrls => ({
                  ...prevImageUrls,
                  [review.user]: defaultUrl
                }));
              }
            }
          }
        }
      }
      
      setReviewsSeguidores(tempReviewsSeguidores); // Actualizar el estado fuera del bucle
    }
    

    const fetchReviews = async () => {
      try {
        const q = query(collection(db, 'Resenas'), where('user', '!=', userID));
        const querySnapshot = await getDocs(q);
        const reviewsData: Review[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
        setReviews(reviewsData);

        const accessToken = await fetchAccessToken();
        for (const review of reviewsData) {
          // Buscamos las portadas de cada reseña
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

          // Obtener la URL de la imagen de usuario si no está en el array
          if (!imageUrls[review.user]) {
            const imageRef = ref(storage, `${review.user}.png`);
            try {
              const url = await getImageUrl(imageRef);
              if (url) {
                setImageUrls(prevImageUrls => ({
                  ...prevImageUrls,
                  [review.user]: url
                }));
              }
            } catch (error) {
              console.log('Error:', error)
            }
          }
        }
        setCargando(false);
      } catch (error) {
        console.error('Error al obtener las reseñas del usuario:', error);
      }
    };

    fetchReviews();
    fetchFollowing();
  }, []);

  const getImageUrl = async (imageRef) => {
    try {
      const url = await getDownloadURL(imageRef);
      return url;
    } catch (error) {
      const defaultImageRef = ref(storage, `dummy.png`);
      const defaultUrl = await getDownloadURL(defaultImageRef);
      return defaultUrl;
    }
  };

  if (cargando) {
    return (
      <div className="text-center">
        <div role="status">
          <svg aria-hidden="true" className="mt-10 inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
          </svg>
          <span className="sr-only">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-4xl font-extrabold ml-4">Tu feed:</h2>
      <ul className='ml-4'>
        {reviewsSeguidores.map(review => (
          <li key={review.id} className="ml-4 mt-4">
            <div className="flex items-center">
              {portada[review.id] && (
                <img src={portada[review.id]} alt="Portada del juego" />
              )}
              <div>
                <div className="flex items-center ml-4 mt-4">
                  {imageUrls[review.user] && (
                    <img src={imageUrls[review.user]} alt={`Imagen de ${review.user}`} className="w-8 h-8 square-full rounded-lg" />
                  )}
                  <Link href={`/detalle?usuario=${encodeURIComponent(review.user)}`} className="ml-2 text-sm font-medium text-blue hover:text-gray-300">
                    {review.user}
                  </Link>
                </div>
                <p className="ml-4 text-sm font-medium">{review.Nombre}</p>
                <div className="ml-4 mt-4 flex items-center">
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
                  <p className="text-sm font-medium">{review.nota} de 5</p>
                </div>
                <p className="ml-4 text-sm font-medium">{review.resena}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <h2 className="text-4xl font-extrabold ml-4">Reseñas de otros usuarios:</h2>
      <ul className='ml-4'>
        {reviews.map(review => (
          <li key={review.id} className="ml-4 mt-4">
            <div className="flex items-center">
              {portada[review.id] && (
                <img src={portada[review.id]} alt="Portada del juego" />
              )}
              <div>
                <div className="flex items-center ml-4 mt-4">
                  {imageUrls[review.user] && (
                    <img src={imageUrls[review.user]} alt={`Imagen de ${review.user}`} className="w-8 h-8 square-full rounded-lg" />
                  )}
                  <Link href={`/detalle?usuario=${encodeURIComponent(review.user)}`} className="ml-2 text-sm font-medium text-blue hover:text-gray-300">
                    {review.user}
                  </Link>
                </div>
                <p className="ml-4 text-sm font-medium">{review.Nombre}</p>
                <div className="ml-4 mt-4 flex items-center">
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
                  <p className="text-sm font-medium">{review.nota} de 5</p>
                </div>
                <p className="ml-4 text-sm font-medium">{review.resena}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}