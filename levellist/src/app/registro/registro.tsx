export default function Registro() {
    return (
        <main className="max-w-sm mx-auto justify-items-center mt-10 ">
            <h1 className="text-2xl mb-4">¡Únete a levellist!</h1>
            <p className="mb-4 text-sm">Comienza rápidamente a compartir tus opiniones con miles de usuarios.</p>
            <div>
                <form className="max-w-sm">
                    <div className="mb-5">     
                        <input type="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-2 focus:ring-gray-100 invalid:border-pink-500 invalid:text-pink-600
                        focus:invalid:border-pink-500 focus:invalid:ring-pink-500" placeholder="Correo electrónico" required />
                    </div>
                    <div className="mb-5">
                        <input type="password" id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-2 focus:ring-gray-100 invalid:border-pink-500 invalid:text-pink-600
                         focus:invalid:border-pink-500 focus:invalid:ring-pink-500" placeholder="Contraseña" required />
                    </div>
                    <button type="submit" className="text-white bg-gray-500 hover:bg-gray-600 focus:ring-2 focus:outline-none font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ">¡Vamos!</button>
                </form>
            </div>
        </main>
    )
}