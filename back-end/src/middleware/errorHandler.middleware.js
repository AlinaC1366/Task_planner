
// Middleware Global de Erori (Plasa de siguranta)
// Aici ajung toate erorile aruncate din aplicatie (prin next(error)).

export const errorHandler = (err, _req, res, _next) => {

  // 1. Logare pentru noi(Developperi)
  console.error("🔥 ERROR:", err);
  
  // 2. Determinare Status
  const status = err.status || 500;  
  const message = err.message || "Eroare internă a serverului.";   
  
  // 3. Raspuns uniform catre Frontend
  res.status(status).json({
    success: false, 

    error: message, 
  });
};
