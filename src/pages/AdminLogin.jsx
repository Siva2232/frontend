import { useState, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import Footer from "../layouts/Footer";
import Navbar from "../layouts/CustomerNavbar";

const AdminLogin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await login(form.email, form.password);
    setLoading(false);
    if (res.success) {
      navigate("/dashboard");
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-10 shadow-2xl rounded-3xl w-full max-w-md border border-gray-100"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white text-3xl mx-auto mb-4 italic">
              P
            </div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">
              Admin Access
            </h2>
            <p className="text-gray-400 font-medium mt-2">Enter your credentials to manage warranties</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                placeholder="admin@example.com"
                required
                className="w-full border-2 border-gray-100 p-4 rounded-xl focus:border-blue-500 outline-none transition-all mt-1"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                className="w-full border-2 border-gray-100 p-4 rounded-xl focus:border-blue-500 outline-none transition-all mt-1"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-black text-lg shadow-lg hover:shadow-blue-200 transition-all active:scale-95 mt-6 disabled:opacity-50"
            >
              {loading ? "AUTHENTICATING..." : "SIGN IN TO DASHBOARD"}
            </button>
          </div>
          
          <div className="mt-8 text-center text-sm text-gray-400">
            For support contact <a href="mailto:it@digitalpress.com" className="text-blue-500 font-bold hover:underline">IT Department</a>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLogin;
