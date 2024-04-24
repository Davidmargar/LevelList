import Image from "next/image";

export default function Home() {
  return (
<main className="z-1 flex flex-col items-start justify-center mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 mt-8 sm:mt-12 md:mt-16 lg:mt-20">
  <Image
    className="relative"
    src="/logo.png"
    alt="Logo de levellist"
    width={280}
    height={60}
    priority />
  <h3 className="text-lg font-semibold mt-4">¿A qué vas a jugar hoy?</h3>
  <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-16 break-words w-full sm:w-2/3 md:w-1/2 lg:w-1/3">
    <p>
      Encuentra reseñas de tus juegos favoritos, ¡o comparte las tuyas propias! Levellist es una comunidad repleta de gente apasionada por los videojuegos, como tú.
    </p>
  </div>
  <div className="mt-8 sm:mt-10">
    <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 sm:mb-0 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Regístrate</button>
    <p className="inline-block">
      o, si ya tienes una cuenta, <a href="#" className="underline decoration-sky-500">inicia sesión</a>.
    </p>
  </div>
</main>
  );
}
