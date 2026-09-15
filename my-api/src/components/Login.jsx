import { useContext, useState } from 'react';
import { loginUser } from '../api/auth';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
    const { login } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = event => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!email.trim() || !password.trim()) {
            setError('Заполните email и пароль');
            return;
        }

        setLoading(true);

        loginUser(email, password)
            .then(data => {
                login(data.user);
                setSuccess(data.message);
                navigate('/');
            })
            .catch(error => {
                setError(error.message || 'Ошибка авторизации');
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className="page">
            <div className="form-card">
                <h2>Вход</h2>

                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            className="input"
                            value={email}
                            onChange={event => setEmail(event.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label className="label">Пароль</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={event => setPassword(event.target.value)}
                        />
                    </div>

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    <button type="submit" disabled={loading} className="button">
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;