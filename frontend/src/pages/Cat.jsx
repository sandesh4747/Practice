import { Link } from "react-router-dom";

export default function Cat() {
  return (
    <div className="min-h-screen">
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to={"/"}>
          <button o className="hover:bg-red-600">
            hello
          </button>
        </Link>
      </div>
    </div>
  );
}
