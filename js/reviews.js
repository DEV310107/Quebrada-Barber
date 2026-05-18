import { auth, db } from "./firebase.js";
import { collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

let currentUser = null;

function getLocalReviews() {
    return JSON.parse(localStorage.getItem('localReviews') || '[]');
}

function saveLocalReview(review) {
    const reviews = getLocalReviews();
    reviews.unshift(review);
    localStorage.setItem('localReviews', JSON.stringify(reviews));
}

function renderReviews(reviews) {
    const reviewsContainer = document.getElementById('reviewsContainer');
    reviewsContainer.innerHTML = '';

    if (!reviews || reviews.length === 0) {
        reviewsContainer.innerHTML = '<p style="color: #ccc; text-align: center;">Nenhuma avaliação ainda. Seja o primeiro!</p>';
        return;
    }

    reviews.forEach((review) => {
        const reviewElement = createReviewElement(review);
        reviewsContainer.appendChild(reviewElement);
    });
}

function showReviewError(message) {
    const reviewsContainer = document.getElementById('reviewsContainer');
    reviewsContainer.innerHTML = `<p style="color: #ccc; text-align: center;">${message}</p>`;
}

// Verificar se usuário está logado
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const addReviewBtn = document.getElementById('addReviewBtn');
    if (addReviewBtn) {
        if (user) {
            addReviewBtn.style.display = 'block';
            addReviewBtn.title = `Logado como ${user.email}. Deixe sua avaliação!`;
        } else {
            addReviewBtn.style.display = 'none';
        }
    }
});

// Carregar avaliações em tempo real
export function loadReviews() {
    const reviewsContainer = document.getElementById('reviewsContainer');
    const localReviews = getLocalReviews();

    if (localReviews.length > 0) {
        renderReviews(localReviews);
    }

    try {
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, orderBy("timestamp", "desc"));

        onSnapshot(q, (snapshot) => {
            const firebaseReviews = [];

            snapshot.forEach((doc) => {
                firebaseReviews.push(doc.data());
            });

            if (firebaseReviews.length > 0) {
                renderReviews(firebaseReviews);
                return;
            }

            if (localReviews.length > 0) {
                return;
            }

            showReviewError('Nenhuma avaliação ainda. Seja o primeiro!');
        }, (erro) => {
            console.error('Erro ao carregar avaliações do Firebase:', erro);
            if (localReviews.length === 0) {
                showReviewError('Não foi possível carregar as avaliações. Tente novamente mais tarde.');
            }
        });
    } catch (erro) {
        console.error('Erro na inicialização do Firebase para avaliações:', erro);
        if (localReviews.length === 0) {
            showReviewError('Não foi possível carregar as avaliações. Tente novamente mais tarde.');
        }
    }
}

// Criar elemento de avaliação
function createReviewElement(review) {
    const div = document.createElement('div');
    div.className = 'review-item';
    
    const stars = '⭐'.repeat(review.rating);
    const date = new Date(review.timestamp).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
    
    // Limitar comprimento do comentário
    let displayComment = review.comment;
    if (displayComment && displayComment.length > 100) {
        displayComment = displayComment.substring(0, 100) + '...';
    }
    
    // Verificar se a avaliação é do usuário logado
    const isOwnReview = currentUser && review.userId === currentUser.uid;
    const badge = isOwnReview ? '<span style="color: #d4af37; font-size: 0.7em; margin-left: 4px;">(Sua avaliação)</span>' : '';
    
    div.innerHTML = `
        <div class="review-header">
            <img src="img/logo.png" alt="Usuário">
            <div class="review-info">
                <span class="review-name">${review.userName} ${badge}</span>
                <span class="review-date">${date}</span>
            </div>
        </div>
        <div class="review-stars">${stars} ${review.rating}/5</div>
        ${displayComment ? `<p class="review-comment">${displayComment}</p>` : ''}
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
    const comment = document.getElementById('commentInput').value.trim();

    if (!rating) {
        alert('Por favor, selecione uma classificação!');
        return;
    }

    try {
        const reviewData = {
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email || 'Anônimo',
            userEmail: currentUser.email,
            rating: parseInt(rating),
            comment: comment,
            timestamp: new Date().getTime()
        };

        await addDoc(collection(db, "reviews"), reviewData);

        // Limpar formulário
        document.getElementById('ratingInput').value = '';
        document.getElementById('commentInput').value = '';
        document.getElementById('reviewModal').style.display = 'none';

        alert('✅ Avaliação enviada com sucesso! Obrigado!');
        loadReviews();
    } catch (erro) {
        console.error('Erro ao enviar avaliação:', erro);
        const reviewData = {
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email || 'Anônimo',
            userEmail: currentUser.email,
            rating: parseInt(rating),
            comment: comment,
            timestamp: new Date().getTime()
        };
        saveLocalReview(reviewData);
        alert('✅ Avaliação salva localmente. Será exibida quando a conexão estiver disponível.');
        document.getElementById('ratingInput').value = '';
        document.getElementById('commentInput').value = '';
        document.getElementById('reviewModal').style.display = 'none';
        loadReviews();
    }
});

// Carregar avaliações ao inicializar
loadReviews();
