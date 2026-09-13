const API_URL = 'http://localhost:5000/api/auth';

export async function loginUser(email, password) {
    const response = await fetch(
        `${API_URL}/login`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        }
    );

    if (!response.ok) {
        throw new Error('Ошибка авторизации');
    }

    return await response.json();
}

export async function registerUser(userData) {
    const response = await fetch(
        `${API_URL}/register`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        }
    );

    if (!response.ok) {
        throw new Error('Ошибка регистрации');
    }

    return await response.json();
}