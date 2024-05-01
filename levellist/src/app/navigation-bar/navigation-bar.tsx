'use client'

import React, { useState } from 'react';

export default function NavigationBar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <div className="w-full flex flex-wrap justify-end p-4">
            <button 
                type="button" 
                onClick={toggleMenu} 
                className="inline-flex p-2 w-10 h-10 justify-end text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" 
                aria-controls="navbar-default" 
                aria-expanded={menuOpen ? "true" : "false"}>
                <span className="sr-only">Abrir menú</span>
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
                </svg>
            </button>
            <div className={`${menuOpen ? "" : "hidden"} w-full md:block md:w-auto justify-end`} id="navbar-default">
                <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 md:flex-row md:space-x-3 rtl:space-x-reverse">
                    <li>
                        <a href="#" className="block py-2 px-3 text-white rounded hover:font-bold" aria-current="page">Inicio</a>
                    </li>
                    <li>
                        <a href="#" className="block py-2 px-3 text-white rounded hover:font-bold">Registro</a>
                    </li>
                    <li>
                        <a href="#" className="block py-2 px-3 text-white rounded hover:font-bold">Juegos</a>
                    </li>
                    <li>
                        <a href="#" className="block py-2 px-3 text-white rounded hover:font-bold">Contacto</a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
