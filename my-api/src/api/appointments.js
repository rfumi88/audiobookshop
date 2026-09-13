const API_URL = 'http://localhost:5000/api/appointments';

async function checkResponse(response, message) {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.details || message);
    }

    return data;
}

export async function createOrder(userId) {
    try {
        const response = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId
            })
        });

        return await checkResponse(
            response,
            'Не удалось оформить заказ'
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

export async function getUserOrders(userId) {
    try {
        const response = await fetch(
            `${API_URL}/user/${userId}`
        );

        return await checkResponse(
            response,
            'Не удалось загрузить заказы'
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