@echo off
title Motor de Auditoria ISO
echo ===================================================
echo   Iniciando Motor de Auditoria ISO...
echo ===================================================
echo.

IF NOT EXIST "node_modules" (
    echo Instalando dependencias necesarias (solo la primera vez)...
    call npm install
)

echo Iniciando servidor local...
start http://localhost:5173/
call npm run dev
