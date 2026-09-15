const API_URL = 'http://localhost:5000/api/categories';

export async function getCategories() {
    try{
        const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error('Ошибка при получении категорий');
    }

    return await response.json();
    }
    catch {
        throw new Error('Не удалось подключиться к серверу');
    }
}

export async function createCategory(category) {
    try {
        const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(category)
    });

    if (!response.ok) {
        throw new Error('Ошибка при создании категории');
    }

    return await response.json();

    }
    catch {
        throw new Error('Не удалось подключиться к серверу');
    }
    
}

export async function deleteCategory(categoryId) {
    try{
        const response = await fetch(
        `${API_URL}/${categoryId}`,
        {
            method: 'DELETE'
        }
    );

    if (!response.ok) {
        throw new Error('Ошибка при удалении категории');
    }

    return await response.json();

    }
    catch {
        throw new Error('Не удалось подключиться к серверу');
    }
    
}