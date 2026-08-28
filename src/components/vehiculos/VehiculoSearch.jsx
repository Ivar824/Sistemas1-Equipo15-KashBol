import React, { useState } from 'react';
import { Search, Loader2, X } from 'lucide-react';

/**
 * Componente VehiculoSearch (HU-04)
 * Permite buscar vehículos por placa con normalización a mayúsculas, trim y validación de campo vacío.
 */
export default function VehiculoSearch({ onSearch, onReset, isLoading }) {
  const [placaInput, setPlacaInput] = useState('');
  const [errorVacio, setErrorVacio] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorVacio('');

    // 1. Validar y limpiar placa (trim y mayúsculas)
    const placaLimpia = placaInput.trim().toUpperCase();

    if (!placaLimpia) {
      setErrorVacio('Ingrese una placa para realizar la búsqueda.');
      return;
    }

    // 2. Ejecutar búsqueda a través del callback padre
    onSearch(placaLimpia);
  };

  const handleLimpiar = () => {
    setPlacaInput('');
    setErrorVacio('');
    if (onReset) {
      onReset();
    }
  };

  const handleChange = (e) => {
    setPlacaInput(e.target.value);
    if (errorVacio) {
      setErrorVacio('');
    }
  };

  return (
    <div className="space-y-2">
      <form
        onSubmit={handleSubmit}
        className="bg-taller-surface border border-taller-border rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shadow-sm"
      >
        <label
          htmlFor="search-vehiculo-placa"
          className="text-xs font-bold text-gray-300 uppercase tracking-wider shrink-0 flex items-center gap-1.5"
        >
          <Search className="w-3.5 h-3.5 text-blue-400" />
          <span>CONSULTAR PLACA:</span>
        </label>

        <div className="relative flex-1">
          <input
            id="search-vehiculo-placa"
            type="text"
            maxLength={15}
            disabled={isLoading}
            placeholder="Ingrese la placa a consultar (ej: ABC-123, abc-123)..."
            value={placaInput}
            onChange={handleChange}
            className={`w-full bg-taller-card border rounded-lg pl-4 pr-9 py-2 text-sm font-mono text-gray-100 placeholder-gray-500 focus:outline-none transition-colors ${
              errorVacio
                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                : 'border-taller-border focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          {placaInput && (
            <button
              type="button"
              onClick={handleLimpiar}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
              title="Limpiar campo"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Consultando...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Consultar</span>
              </>
            )}
          </button>

          {placaInput && (
            <button
              type="button"
              onClick={handleLimpiar}
              disabled={isLoading}
              className="text-xs text-gray-400 hover:text-white px-3 py-2 rounded-lg border border-taller-border bg-taller-card hover:bg-taller-border transition-colors"
            >
              Restablecer
            </button>
          )}
        </div>
      </form>

      {/* Mensaje de validación si el campo está vacío */}
      {errorVacio && (
        <p className="text-xs text-red-400 font-medium px-2 text-left animate-fadeIn">
          {errorVacio}
        </p>
      )}
    </div>
  );
}
