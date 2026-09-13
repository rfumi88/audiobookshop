const API_URL = 'http://localhost:5000/api/appointments';

export async function createOrder(userId) {
    const response = await fetch(
        `${API_URL}/checkout`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId
            })
        }
    );

    if (!response.ok) {
        throw new Error(
            'Ошибка при оформлении заказа'
        );
    }

    return await response.json();
}

export async function getUserOrders(userId) {
    const response = await fetch(
        `${API_URL}/user/${userId}`
    );

    if (!response.ok) {
        throw new Error(
            'Ошибка при получении заказов'
        );
    }

    return await response.json();
}