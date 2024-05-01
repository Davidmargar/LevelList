'use client'

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Landing() {
    const router = useRouter()
    
    return(
        <main className="items-start justify-center mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 mt-8 sm:mt-12 md:mt-16 lg:mt-20 bg-gray-800">
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
                <button type="button" className="text-white bg-gray-500 hover:bg-gray-600 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 sm:mb-0 focus:outline-none" onClick={() => router.push('/registro')}>Regístrate</button>
                <p className="inline-block">
                    o, si ya tienes una cuenta, <Link href="/login" className="underline decoration-gray-100">inicia sesión</Link>.
                </p>
            </div>
        </main>
    )
}