const API_URL = 'http://localhost:5000/api/appointments';

function checkResponse(response, message) {
    return response.json().then((data) => {
        if (!response.ok) {
            throw new Error(data.error || data.details || message);
        }
        return data;
    });
}

export function createOrder(userId) {
    return fetch(
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
    )
        .then((response) =>
            checkResponse(
                response,
                'Не удалось оформить заказ'
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

export function getUserOrders(userId) {
    return fetch(
        `${API_URL}/user/${userId}`
    )
        .then((response) =>
            checkResponse(
                response,
                'Не удалось загрузить заказы'
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