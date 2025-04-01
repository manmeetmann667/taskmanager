"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { firestore, auth, doc, collection, setDoc } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

const Dashboard = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  useEffect(() => {
    // Check Firebase Auth for the logged-in user
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserData({ uid: user.uid, email: user.email });
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleCreateProject = async () => {
    if (!userData?.uid) return;

    try {
      // Generate a new Firestore document reference with an auto-generated ID
      const projectRef = doc(collection(firestore, "AllProjects"));
      const projectId = projectRef.id;

      const projectData = {
        id: projectId, // Store the ID explicitly
        name: projectName,
        description: projectDescription,
        createdAt: new Date(),
        userId: userData.uid,
        userEmail: userData.email,
      };

      // Set project under the user's projects with the same ID
      const userProjectRef = doc(firestore, `users/${userData.uid}/projects`, projectId);
      await setDoc(userProjectRef, projectData);

      // Set project in the global 'AllProjects' collection with the same ID
      await setDoc(projectRef, projectData);

      alert("Project Created Successfully!");
      setProjectName("");
      setProjectDescription("");
      setModalOpen(false);
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading user data...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard">
                <span className="text-xl font-bold cursor-pointer">Dashboard</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Create Project
                </button>
                <Link
                  href="/all-projects"
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  All Projects
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto p-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Email" value={userData?.email || "N/A"} />
          </div>
        </div>
      </main>

      {/* Project Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Create New Project</h2>
            <input
              type="text"
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full p-2 border rounded mb-3"
            />
            <textarea
              placeholder="Project Description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full p-2 border rounded mb-3"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setModalOpen(false)} className="bg-gray-400 px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={handleCreateProject} className="bg-blue-500 text-white px-4 py-2 rounded">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Info Row Component
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-gray-700">
      <span className="font-semibold">{label}:</span> {value}
    </p>
  </div>
);

export default Dashboard;
