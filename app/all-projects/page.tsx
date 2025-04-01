"use client";

import { useEffect, useState } from "react";
import { auth, firestore } from "../lib/firebase";
import { collection, getDocs, doc, DocumentReference } from "firebase/firestore";
import Link from "next/link";

const AllProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [userProjectRefs, setUserProjectRefs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserProjects = async (uid: string) => {
      try {
        console.log("Fetching projects for user:", uid);

        const userProjectsRef = collection(firestore, `users/${uid}/projects`);
        const querySnapshot = await getDocs(userProjectsRef);

        const projectIds = new Set(
          querySnapshot.docs
            .map((doc) => {
              const projectRef = doc.data().projectRef as DocumentReference | undefined;
              if (projectRef) {
                console.log("Project Ref Found:", projectRef.id);
              } else {
                console.warn("No projectRef found in user projects!");
              }
              return projectRef?.id || null;
            })
            .filter((id): id is string => id !== null) // Ensure only valid strings
        );

        console.log("User's Project References:", projectIds); // Debugging log

        setUserProjectRefs(projectIds);
      } catch (error) {
        console.error("Error fetching user projects:", error);
      }
    };

    const fetchAllProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "AllProjects"));
        const projectList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("All Projects:", projectList); // Debugging log

        setProjects(projectList);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        console.log("Logged-in User ID:", currentUser.uid); // Debugging log
        fetchUserProjects(currentUser.uid);
      }
    });

    fetchAllProjects();
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Projects</h1>
        <Link href="/dashboard" className="text-blue-500 hover:underline">Back to Dashboard</Link>
      </nav>

      <main className="max-w-6xl mx-auto mt-6">
        {loading ? (
          <p className="text-center text-lg">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-center text-gray-500">No projects available</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {projects.map((project) => {
              const isUserProject = userProjectRefs.has(project.id);

              console.log(`Project ID: ${project.id}, Owned by User: ${isUserProject}`); // Debugging log

              return (
                <div key={project.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">
                  <h2 className="text-xl font-semibold">{project.name}</h2>
                  <p className="text-gray-600 mt-2">{project.description}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Created At: {new Date(project.createdAt.seconds * 1000).toLocaleDateString()}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/projects/${project.id}`}>
                      <button className="bg-blue-500 text-white px-4 py-2 rounded">More</button>
                    </Link>
                    {isUserProject && (
                      <Link href={`/edit-project/${project.id}`}>
                        <button className="bg-green-500 text-white px-4 py-2 rounded">Edit</button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllProjects;
