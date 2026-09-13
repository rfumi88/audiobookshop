const API_URL = 'http://localhost:5000/api/cart';

async function checkResponse(response, message) {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.details || message);
    }

    return data;
}

export async function getCart(userId) {
    try {
        const response = await fetch(`${API_URL}/${userId}`);

        return await checkResponse(
            response,
            'Не удалось загрузить корзину'
        );
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(
                'Не удалось подключиться к серверу',
                { cause: error }
            );
        }

        throw error;
    }
}

export async function addToCart(userId, serviceId, quantity = 1) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                serviceId,
                quantity
            })
        });

        return await checkResponse(
            response,
            'Не удалось добавить аудиокнигу в корзину'
        );
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(
                'Не удалось подключиться к серверу',
                { cause: error }
            );
        }

        throw error;
    }
}

export async function updateCartItem(itemId, quantity) {
    try {
        const response = await fetch(
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
        );

        return await checkResponse(
            response,
            'Не удалось изменить количество'
        );
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(
                'Не удалось подключиться к серверу',
                { cause: error }
            );
        }

        throw error;
    }
}

export async function removeFromCart(itemId) {
    try {
        const response = await fetch(
            `${API_URL}/item/${itemId}`,
            {
                method: 'DELETE'
            }
        );

        return await checkResponse(
            response,
            'Не удалось удалить товар'
        );
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(
                'Не удалось подключиться к серверу',
                { cause: error }
            );
        }

        throw error;
    }
}