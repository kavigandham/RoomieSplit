import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import GroupList from './components/GroupList';
import Login from './components/Login';
import Register from './components/Register';
import CreateGroup from './components/CreateGroup';
import GroupDetail from './components/GroupDetail';
import AddExpense from './components/AddExpense';
import SettleUp from './components/SettleUp';
import JoinGroup from './components/JoinGroup';

function App() {
  const { currentUser, loading } = useAuth(); // you must return loading from AuthContext

  if (loading) {
    return <p>Loading...</p>; // or a spinner
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/join" element={<JoinGroup />} />

        {/* Private routes */}
        {currentUser ? (
          <>
            <Route path="/" element={<GroupList />} />
            <Route path="/create" element={<CreateGroup />} />
            <Route path="/groups/:groupId" element={<GroupDetail />} />
            <Route path="/groups/:groupId/add" element={<AddExpense />} />
            <Route path="/groups/:groupId/settle" element={<SettleUp />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
