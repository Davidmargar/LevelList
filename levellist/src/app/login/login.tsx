'use client'
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { useState } from "react"
import {useRouter} from 'next/navigation'

export default function Login() {

    let [email, setEmail] = useState('')
    let [password, setPassword] = useState('')
    let [remember, setRemember] = useState('')
    const router = useRouter()

    const handleEmailChange = (event) => {
        setEmail(event.target.value)
    }

    const handleRememberChange = (event) => {
        setRemember(event.target.value)
    }

    const handlePassChange = (event) => {
        setPassword(event.target.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault() // Evitar que el formulario se envíe automáticamente

        const auth = getAuth()
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            
            if(userCredential.user.email != null) {
                localStorage.setItem('email', userCredential.user.email)
                console.log(localStorage.getItem('email'))
            }

            if(userCredential.user.displayName != null) {
                localStorage.setItem('user', userCredential.user.displayName)
                console.log(localStorage.getItem('user'))
            }

            if(remember) {
                localStorage.setItem('remember', 'S')
            }

            router.push('/')
            
        })
        .catch((error) => {
            console.error("Error de inicio de sesión:", error);
            // Limpiamos el almacenamiento local, por si acaso.
            localStorage.removeItem('email');
            localStorage.removeItem('user');
        })
    }
    
    return (
        <main className="max-w-sm mx-auto justify-items-center">
            <h1 className="text-2xl mb-4">¡Bienvenido!</h1>
            <div>
                <form className="max-w-sm" onSubmit={handleSubmit}>
                    <div className="mb-5">     
                        <input type="email" 
                        id="email" 
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-2 focus:ring-gray-100 invalid:border-pink-500 invalid:text-pink-600
                        focus:invalid:border-pink-500 focus:invalid:ring-pink-500" 
                        placeholder="Correo electrónico" 
                        value={email} // Asignamos el valor de email al campo de entrada
                        onChange={handleEmailChange} // Manejador para actualizar el estado cuando cambie el valor del campo
                        required />
                    </div>
                    <div className="mb-5">
                        <input type="password" 
                        id="password" 
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-2 focus:ring-gray-100 invalid:border-pink-500 invalid:text-pink-600
                        focus:invalid:border-pink-500 focus:invalid:ring-pink-500" 
                        placeholder="Contraseña"
                        value={password}
                        onChange={handlePassChange}
                        required />
                    </div>
                    <div className="flex items-start mb-5">
                        <div className="flex items-center h-5">
                            <input id="remember" 
                            type="checkbox" 
                            value= {remember}
                            onChange={handleRememberChange} 
                            className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-gray-300" 
                            />
                        </div>
                        <label htmlFor="remember" className="ms-2 text-sm font-medium">Recuérdame</label>
                    </div>
                    <button type="submit" 
                    className="text-white bg-gray-500 hover:bg-gray-600 focus:ring-2 focus:outline-none font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ">Enviar</button>
                </form>
            </div>
        </main>
    )
}