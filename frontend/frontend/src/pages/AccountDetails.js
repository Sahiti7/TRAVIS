import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AccountDetails.css';

const AccountDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [name, setName] = useState(location.state?.name || '');
  const [accountNumber, setAccountNumber] = useState('');
  const [pin, setPin] = useState('');

  // ===============================
  // ✅ FIXED handleSubmit
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        'http://localhost:8000/account-details/verify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },

          // ⭐ IMPORTANT FIX
          body: JSON.stringify({
            name,
            accountNumber,
            password: pin   // map PIN → password
          })
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Account verified!');
        navigate('/query');
      } else {
        alert(data.message || 'Verification failed.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Server error.');
    }
  };

  return (
    <div className="account-details-container">
      <div className="account-details-page">
        <h2>
          <img
            src="https://img.icons8.com/color/48/000000/bank-card-back-side.png"
            alt="card"
            className="icon"
          />
          Account Details
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Enter your account number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter your PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />

          <button type="submit">Verify</button>
        </form>
      </div>
    </div>
  );
};

export default AccountDetails;