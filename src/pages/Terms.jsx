import CustomerNavbar from "../layouts/CustomerNavbar";
import Footer from "../layouts/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <CustomerNavbar />
      <main className="max-w-5xl mx-auto p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6">Terms and Conditions</h1>
        <p className="mb-4 text-base sm:text-lg leading-relaxed">
          Welcome to Lancaster Audio Warranty Portal. These Terms and Conditions govern your use of our application. By accessing our services, you agree to these terms.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">1. Use of Service</h2>
        <p className="text-slate-700">You may use the portal to register warranties, track service, and manage your assigned devices, subject to applicable registration and policies.</p>

        <h2 className="text-xl font-bold mt-8 mb-3">2. Account Responsibility</h2>
        <p className="text-slate-700">You are responsible for maintaining the confidentiality of your account credentials and all actions through your account.</p>

        <h2 className="text-xl font-bold mt-8 mb-3">3. Prohibited Conduct</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-700">
          <li>Unauthorized access, script abuse, or data scraping.</li>
          <li>Impersonation of others or misrepresentation.</li>
          <li>Using the service in violation of local laws.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">4. Warranty Disclaimer</h2>
        <p className="text-slate-700">Platform is provided "as is" and we disclaim any implied warranties not explicitly stated.</p>

        <h2 className="text-xl font-bold mt-8 mb-3">5. Limitation of Liability</h2>
        <p className="text-slate-700">We are not responsible for indirect, incidental, or consequential damages arising from the use of the portal.</p>

        <h2 className="text-xl font-bold mt-8 mb-3">6. Changes</h2>
        <p className="text-slate-700">We may update these terms; key changes will be posted on this page.</p>

        <p className="mt-8 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
