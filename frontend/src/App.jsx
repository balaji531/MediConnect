import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import BookAppointment from './pages/BookAppointment';
import Chat from './pages/Chat';
import Prescriptions from './pages/Prescriptions';
import PrescriptionDetail from './pages/PrescriptionDetail';
import VideoCall from './pages/VideoCall';
import CreatePrescription from './pages/CreatePrescription';
import SymptomChecker from "./pages/SymptomChecker";
import AdminDashboard from "./pages/AdminDashboard";
import { useAuth } from './context/AuthContext';
import { useSocket } from './hooks/useSocket';

function DashboardRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/dashboard/${user.role}`} replace />;
}
function SocketManager() {
  const { user } = useAuth();

  useSocket(user?._id);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
         <SocketManager />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route
            path="/dashboard/admin"
            element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                }
          />
          <Route 
              path="/dashboard" 
              element={<ProtectedRoute>
                          <DashboardRedirect />
                       </ProtectedRoute>
                      }
          />
          <Route
            path="/prescriptions/new"
            element={
                      <ProtectedRoute allowedRoles={['doctor']}>
                        <CreatePrescription />
                      </ProtectedRoute>
                    }
          />
          <Route path="/symptom-checker" element={<SymptomChecker />} />
          <Route
            path="/dashboard/patient"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/doctor"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctors"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <Doctors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments/book"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <BookAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route path="/chat/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route
            path="/prescriptions"
            element={
              <ProtectedRoute>
                <Prescriptions />
              </ProtectedRoute>
            }
          />
          <Route path="/prescriptions/:id" element={<ProtectedRoute><PrescriptionDetail /></ProtectedRoute>} />
          <Route
            path="/video"
            element={
              <ProtectedRoute>
                <VideoCall />
              </ProtectedRoute>
            }
          />
          <Route path="/video/:appointmentId" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
