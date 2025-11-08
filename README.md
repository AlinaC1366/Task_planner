# Task-Planner Aplicație web pentru planificarea task-urilor

Obiectiv:
>Realizarea unei aplicații web care permite planificarea unor activități.

Descriere: 
>Aplicația trebuie să permită alocarea și monitorizarea realizării unor task-uri. Platforma este bazată pe o aplicație web cu arhitectură de tip Single Page Application accesibilă în browser de pe desktop, dispozitive mobile sau tablete (considerând preferințele utilizatorului).

Tehnologii:
- Front-end: React.js
- Back-end: Node.js + Express + Prisma ORM + SQL Lite

Functionalitati: 
- Înregistrare și autentificare utilizatori
- Ciclu de task:
> - Stare 0:
>   
>   Logare ca Administrator.
>   
>   Crearea de Manager, Utilizator, Executanti
>   
> - Starea 1: OPEN/ PENDING
>   
>   Logare ca Manager.
>   
>   Crearea unui Task (stare OPEN).
>   
>   Alocarea task-ului unui executant -> Starea devine PENDING.
>
> - Starea 2: PENDING -> COMPLETED
>   
>   Logare ca Executant.
>   
>   Marcarea task-ului ca realizat -> Starea devine COMPLETED.
>   
> - Starea 3: COMPLETED -> CLOSED
>   
>   Logarea ca Manager.
> 
>   Verificarea și închiderea task-ului -> Starea finală CLOSED.

- Restrictii:
> - Un utilizator care nu este manager are un manager alocat
> - Fiecare task trebuie să aibă o descriere suficientă pentru a fi realizat.
> - Managerul vede toate task-urile echipei și poate consulta istoricul complet al oricărui Executant.
> - Executantul vede doar task-urile alocate lui (cele PENDING) și propiul istoric (COMPLETED și CLOSED).
