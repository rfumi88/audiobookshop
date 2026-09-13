const API_URL = 'http://localhost:5000/api/auth';

async function checkResponse(response, message) {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.details || message);
    }

    return data;
}

export async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        return await checkResponse(
            response,
            'Ошибка авторизации'
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

export async function registerUser(userData) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        return await checkResponse(
            response,
            'Ошибка регистрации'
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