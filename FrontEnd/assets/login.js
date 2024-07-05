// Exécution du code JS lorsque la page est chargée
document.addEventListener('DOMContentLoaded', function() {
    
    // Ajout d'un écouteur d'événements pour la soumission du formulaire de connexion
    document.getElementById('user-login-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire
        
        // Récupération des données du formulaire
        const user = {
            email: document.querySelector('#email').value, // Récupère la valeur de l'input avec l'ID 'email'
            password: document.querySelector('#password').value, // Récupère la valeur de l'input avec l'ID 'password'
        };

        // Envoi de la requête pour s'authentifier
        fetch('http://localhost:5678/api/users/login', {
            method: 'POST', // Méthode de la requête
            headers: {
                'Content-Type': 'application/json' // Indique que le corps de la requête est en JSON
            },
            body: JSON.stringify(user), // Convertit l'objet 'user' en JSON
        })
        .then(function(response) {
            // Gestion des différents statuts de réponse
            switch(response.status) {
                case 500:
                case 503:
                    alert("Erreur côté serveur!"); // Affiche une alerte pour les erreurs serveur
                    break;
                case 401:
                case 404:
                    alert("Email ou mot de passe incorrect!"); // Affiche une alerte pour les erreurs de connexion
                    break;
                case 200:
                    console.log("Authentification réussie.");
                    return response.json(); // Retourne les données JSON de la réponse
                    break;
                default:
                    alert("Erreur inconnue!"); // Affiche une alerte pour les erreurs inconnues
                    break;
            }
        })
        .then(function(data) {
            console.log(data); // Affiche les données reçues dans la console
            localStorage.setItem('token', data.token); // Stocke le token dans le localStorage
            localStorage.setItem('userId', data.userId); // Stocke l'ID de l'utilisateur dans le localStorage
            
            // Redirection vers la page 'index.html'
            location.href = 'index.html';
        })
        .catch(function(err) {
            console.log(err); // Affiche l'erreur dans la console
        });
    });
});
