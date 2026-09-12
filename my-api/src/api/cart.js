const API_URL = 'http://localhost:5000/api/cart';

function checkResponse(response, message) {
    return response.json().then((data) => {
        if (!response.ok) {
            throw new Error(data.error || data.details || message);
        }
        return data;
    });
}

export function getCart(userId) {
    return fetch(`${API_URL}/${userId}`)
        .then((response) =>
            checkResponse(
                response,
                'Не удалось загрузить корзину'
            )
        )
        .catch((error) => {
            if (error instanceof TypeError) {
                throw new Error(
                    'Не удалось подключиться к серверу'
                );
            }
            throw error;
        });
}

export function addToCart(userId, serviceId, quantity = 1) {
    return fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId,
            serviceId,
            quantity
        })
    })
        .then((response) =>
            checkResponse(
                response,
                'Не удалось добавить аудиокнигу в корзину'
            )
        )
        .catch((error) => {
            if (error instanceof TypeError) {
                throw new Error(
                    'Не удалось подключиться к серверу'
                );
            }
            throw error;
        });
}

export function updateCartItem(itemId,quantity) {
    return fetch(
        `${API_URL}/item/${itemId}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quantity
            })
        }
    )
        .then((response) =>
            checkResponse(
                response,
                'Не удалось изменить количество'
            )
        )
        .catch((error) => {
            if (error instanceof TypeError) {
                throw new Error(
                    'Не удалось подключиться к серверу'
                );
            }
            throw error;
        });
}

export function removeFromCart(itemId) {
    return fetch(
        `${API_URL}/item/${itemId}`,
        {
            method: 'DELETE'
        }
    )
        .then((response) =>
            checkResponse(
                response,
                'Не удалось удалить товар'
            )
        )
        .catch((error) => {
            if (error instanceof TypeError) {
                throw new Error(
                    'Не удалось подключиться к серверу'
                );
            }
            throw error;
        });
}