import CustomerNavbar from "../layouts/CustomerNavbar";
import Footer from "../layouts/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <CustomerNavbar />
      <main className="max-w-5xl mx-auto p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">Privacy Policy</h1>
        <p className="mb-4 text-base sm:text-lg leading-relaxed">
          At Lancaster Audio Warranty Portal, protecting your privacy is a top priority. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our website and services.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">1. Information We Collect</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-700">
          <li>Personal data you provide during registration (name, phone, email, address, serial numbers).</li>
          <li>Usage data from analytics and support activity.</li>
          <li>Device information and cookies for user session and performance.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">2. How We Use Data</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-700">
          <li>To process warranty and service requests.</li>
          <li>To monitor service history and status tracking.</li>
          <li>To comply with legal and security obligations.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">3. Data Sharing</h2>
        <p className="text-slate-700">We do not sell your data. We may share with service partners or our team for warranty support and legal requests.</p>

        <h2 className="text-xl font-bold mt-8 mb-3">4. Your Rights</h2>
        <p className="text-slate-700">You can request access, correction or deletion of your data by contacting support. We also provide data security measures.</p>

        <h2 className="text-xl font-bold mt-8 mb-3">5. Contact</h2>
        <p className="text-slate-700">For privacy questions, email: <a href="mailto:service@lancasteraudio.com" className="text-blue-600 underline">service@lancasteraudio.com</a>.</p>

        <p className="mt-8 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
