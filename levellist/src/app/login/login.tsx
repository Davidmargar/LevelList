export default function Login() {
    return (
        <main className="max-w-sm mx-auto justify-items-center">
            <h1 className="text-2xl mb-4">¡Bienvenido!</h1>
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
                    <div className="flex items-start mb-5">
                        <div className="flex items-center h-5">
                            <input id="remember" type="checkbox" value="" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-gray-300" required />
                        </div>
                        <label htmlFor="remember" className="ms-2 text-sm font-medium">Recuérdame</label>
                    </div>
                    <button type="submit" className="text-white bg-gray-500 hover:bg-gray-600 focus:ring-2 focus:outline-none font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ">Submit</button>
                </form>
            </div>
        </main>
    )
}