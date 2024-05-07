'use client'
import firebase, { getAuth, createUserWithEmailAndPassword, sendEmailVerification, updateProfile} from "firebase/auth"
import React, { useState } from 'react'

export default function Registro() {

    let [email, setEmail] = useState('')
    let [displayName, setDisplayName] = useState('')
    let [password, setPassword] = useState('')
    let [errorMessage, setErrorMessage] = useState('')
    let [successMessage, setSuccessMessage] = useState('')

    const handleEmailChange = (event) => {
        setEmail(event.target.value)
        setErrorMessage("")
    }

    const handleDisplayChange = (event) => {
        setDisplayName(event.target.value)
    }

    const handlePassChange = (event) => {
        setPassword(event.target.value)
    }

    const handleSubmit = (event) => {
        event.preventDefault() // Evitar que el formulario se envíe automáticamente

        const auth = getAuth()
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential: { user: any }) => {
            // Limpiar campos y manejar éxito
            setEmail('')
            setPassword('')
            const user = userCredential.user
            updateProfile(user, {
                displayName: displayName
            }).then(() => {
                sendEmailVerification(user)
                .then(() => {
                    console.log('Correo enviado.')
                })
                .catch((error) => {
                    console.log(error.message)
                })
                setSuccessMessage('¡Bienvenido a Levellist! Se te ha enviado un correo de activación.')
                //irInicio()
            }).catch((error) => {
                console.log(error)
            })
        })
        .catch((error: { code: any; message: any }) => {
            // Manejar errores y mostrar mensaje de error
            const errorCode = error.code
            if (error.message.includes("auth/email-already-exists") || error.message.includes("auth/email-already-in-use")) {
                setErrorMessage("Ya existe una cuenta asociada a ese correo electrónico.")
                console.log(error.message)
            } else if (error.message.includes("auth/invalid-email")) {
                setErrorMessage("El formato del e-mail no es correcto. Revisa tu dirección de correo.")
                console.log(error.message)
            } else {
                setErrorMessage("Ha ocurrido un error al registrar el usuario. Revisa los datos y prueba de nuevo.")
                console.log(error.message)
            }
        })
    }

    // const irInicio = () => {
    //     router.push('/')
    // }

    return (
        <main className="max-w-sm mx-auto justify-items-center mt-10 ">
            <h1 className="text-2xl mb-4">¡Únete a levellist!</h1>
            <p className="mb-4 text-sm">Comienza rápidamente a compartir tus opiniones con miles de usuarios.</p>
            <div>
                <form className="max-w-sm" onSubmit={handleSubmit}>
                    <div className="mb-5">     
                        <input
                            type="text"
                            id="displayName"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-2 focus:ring-gray-100 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500"
                            placeholder="Nombre de usuario"
                            required
                            value={displayName} // Asignamos el valor de email al campo de entrada
                            onChange={handleDisplayChange} // Manejador para actualizar el estado cuando cambie el valor del campo
                        />
                    </div>
                    <div className="mb-5">     
                        <input
                            type="email"
                            id="email"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-2 focus:ring-gray-100 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500"
                            placeholder="Correo electrónico"
                            required
                            value={email} // Asignamos el valor de email al campo de entrada
                            onChange={handleEmailChange} // Manejador para actualizar el estado cuando cambie el valor del campo
                        />
                    </div>
                    <div className="mb-5">
                        <input 
                            type="password" 
                            id="password" 
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-2 focus:ring-gray-100 invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500" 
                            placeholder="Contraseña" 
                            required
                            value={password}
                            onChange={handlePassChange}
                        />
                    </div>
                    {errorMessage && <div className="text-red-600 mb-3">{errorMessage}</div>}
                    {successMessage && <div className="text-gray-100 mb-3">{successMessage}</div>}
                    <button 
                        type="submit" 
                        className="text-white bg-gray-500 hover:bg-gray-600 focus:ring-2 focus:outline-none font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
                        ¡Vamos!
                    </button>
                </form>
            </div>
        </main>
    )
}