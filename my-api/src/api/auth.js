const API_URL = 'http://localhost:5000/api/auth';

function checkResponse(response, message) {
    return response.json().then((data) => {
        if (!response.ok) {
            throw new Error(data.error || data.details || message);
        }
        return data;
    });
}

export function loginUser(email, password) {
    return fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password
        })
    })
        .then((response) =>
            checkResponse(
                response,
                'Ошибка авторизации'
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

export function registerUser(userData) {
    return fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
        .then((response) =>
            checkResponse(
                response,
                'Ошибка регистрации'
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