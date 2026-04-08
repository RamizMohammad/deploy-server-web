export default function Login() {

  const handleGithubLogin = () => {
    window.location.href = "http://localhost:8001/auth/github/connect";
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">

      <div className="bg-gray-900 p-10 rounded-xl w-96 text-center shadow-xl">

        <h1 className="text-3xl mb-6 font-bold">
          🚀 DeployX
        </h1>

        <button
          onClick={handleGithubLogin}
          className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg hover:bg-gray-700 transition"
        >
          🔗 Continue with GitHub
        </button>

      </div>
    </div>
  );
}