const API_URL = 'http://localhost:5000/api/cart';

export async function getCart(userId) {
     try {
        const response = await fetch(
            `${API_URL}/${userId}`
        );

        if (!response.ok) {
            throw new Error('Ошибка при получении корзины');
    }

        return await response.json();
    } catch {
        throw new Error('Не удалось подключиться к серверу');
    }
}
    
export async function addToCart(
    userId,
    serviceId,
    quantity = 1
) {
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

    if (!response.ok) {
        throw new Error(
            'Ошибка при добавлении аудиокниги в корзину'
        );
    }

    return await response.json();
}

export async function updateCartItem(
    itemId,
    quantity
) {
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

    if (!response.ok) {
        throw new Error(
            'Ошибка при изменении количества'
        );
    }

    return await response.json();
}

export async function removeFromCart(itemId) {
    const response = await fetch(
        `${API_URL}/item/${itemId}`,
        {
            method: 'DELETE'
        }
    );

    if (!response.ok) {
        throw new Error(
            'Ошибка при удалении товара'
        );
    }

    return await response.json();
}