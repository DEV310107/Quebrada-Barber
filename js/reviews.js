import { auth, db } from "./firebase.js";
import { collection, addDoc, query, orderBy, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

let currentUser = null;

// Verificar se usuário está logado
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        document.getElementById('addReviewBtn').style.display = 'block';
    } else {
        document.getElementById('addReviewBtn').style.display = 'none';
    }
});

// Carregar avaliações em tempo real
export function loadReviews() {
    const reviewsContainer = document.getElementById('reviewsContainer');
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
        reviewsContainer.innerHTML = '';
        
        if (snapshot.empty) {
            reviewsContainer.innerHTML = '<p style="color: #ccc; text-align: center;">Nenhuma avaliação ainda. Seja o primeiro!</p>';
            return;
        }

        snapshot.forEach((doc) => {
            const review = doc.data();
            const reviewElement = createReviewElement(review);
            reviewsContainer.appendChild(reviewElement);
        });
    });
}

// Criar elemento de avaliação
function createReviewElement(review) {
    const div = document.createElement('div');
    div.className = 'review-item';
    
    const stars = '⭐'.repeat(review.rating);
    const date = new Date(review.timestamp).toLocaleDateString('pt-BR');
    
    div.innerHTML = `
        <div class="review-header">
            <img src="img/logo.png" alt="Usuário">
            <div class="review-info">
                <span class="review-name">${review.userName}</span>
                <span class="review-date">${date}</span>
            </div>
        </div>
        <div class="review-stars">${stars} ${review.rating}/5</div>
        ${review.comment ? `<p class="review-comment">${review.comment}</p>` : ''}
    `;
    
    return div;
}

// Abrir modal de avaliação
document.getElementById('addReviewBtn')?.addEventListener('click', () => {
    if (!currentUser) {
        alert('Você precisa estar logado para deixar uma avaliação!');
        return;
    }
    document.getElementById('reviewModal').style.display = 'block';
});

// Fechar modal
document.getElementById('closeReviewModal')?.addEventListener('click', () => {
    document.getElementById('reviewModal').style.display = 'none';
});

// Fechar modal ao clicar fora
window.addEventListener('click', (e) => {
    const modal = document.getElementById('reviewModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Enviar avaliação
document.getElementById('submitReviewBtn')?.addEventListener('click', async () => {
    if (!currentUser) {
        alert('Você precisa estar logado!');
        return;
    }

    const rating = document.getElementById('ratingInput').value;
    const comment = document.getElementById('commentInput').value;

    if (!rating) {
        alert('Por favor, selecione uma classificação!');
        return;
    }

    try {
        const reviewData = {
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email || 'Anônimo',
            rating: parseInt(rating),
            comment: comment.trim(),
            timestamp: new Date().getTime()
        };

        await addDoc(collection(db, "reviews"), reviewData);

        // Limpar formulário
        document.getElementById('ratingInput').value = '5';
        document.getElementById('commentInput').value = '';
        document.getElementById('reviewModal').style.display = 'none';

        alert('Avaliação enviada com sucesso!');
    } catch (erro) {
        console.error('Erro ao enviar avaliação:', erro);
        alert('Erro ao enviar avaliação. Tente novamente.');
    }
});

// Carregar avaliações ao inicializar
loadReviews();
