"use client";

import { useEffect, useState } from "react";
import { auth, firestore } from "../lib/firebase";
import { collection, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import Link from "next/link";

const AllProjects = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]); // State to hold the users
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [taskName, setTaskName] = useState(""); // State to store task name
  const [selectedUserId, setSelectedUserId] = useState(""); // State to store selected user
  const [taskStatus, setTaskStatus] = useState(""); // State to store success/failure message

  useEffect(() => {
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

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, "users"));
        const userList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched Users:", userList);  // Debugging log to see the fetched users

        if (userList.length === 0) {
          console.log("No users found in the 'users' collection");
        }
        
        setUsers(userList); // Save the list of users
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        console.log("Logged-in User ID:", currentUser.uid); // Debugging log
        fetchAllProjects();
        fetchUsers(); // Fetch users when logged in
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEditClick = (project: any) => {
    setSelectedProject(project); // Set the selected project to edit
    setModalVisible(true); // Show the modal
  };

  const handleAddTask = async () => {
    if (!taskName || !selectedUserId) {
      setTaskStatus("Please fill in all fields.");
      return;
    }

    try {
      // Create the task for the selected user
      const taskRef = await addDoc(collection(firestore, `users/${selectedUserId}/tasks`), {
        taskName: taskName,
        projectId: selectedProject.id,
        createdAt: new Date(),
      });

      // Add the project reference to the selected user's project collection
      const userProjectRef = doc(firestore, `users/${selectedUserId}/projects`, selectedProject.id);
      await updateDoc(userProjectRef, {
        tasks: [...selectedProject.tasks || [], taskRef.id],
      });

      setTaskStatus("Task added successfully!");
      setTaskName(""); // Clear the task input field
      setSelectedUserId(""); // Clear the selected user
    } catch (error) {
      console.error("Error adding task:", error);
      setTaskStatus("Error adding task. Please try again.");
    }
  };

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
              const isUserProject = user?.uid === project.userId; // Check if the user ID matches

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
                      <button
                        onClick={() => handleEditClick(project)}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {modalVisible && selectedProject && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-2xl font-semibold mb-4">Edit Project</h2>
            <p><strong>Name:</strong> {selectedProject.name}</p>
            <p><strong>Description:</strong> {selectedProject.description}</p>
            <p><strong>Created At:</strong> {new Date(selectedProject.createdAt.seconds * 1000).toLocaleString()}</p>
            
            <div className="mt-4">
              <h3 className="text-xl">Assign Task</h3>
              <input
                type="text"
                placeholder="Enter task name"
                className="mt-2 p-2 border border-gray-300 rounded"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)} // Handle task name input
              />
              <select
                className="mt-2 p-2 border border-gray-300 rounded"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)} // Handle user selection
              >
                <option value="">Select a user</option>
                {users.length > 0 ? (
                  users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))
                ) : (
                  <option value="">No users found</option>
                )}
              </select>
              <button
                onClick={handleAddTask}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Add Task
              </button>
              {taskStatus && <p className="mt-2 text-sm">{taskStatus}</p>} {/* Display status */}
            </div>

            <button
              onClick={() => setModalVisible(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProjects;
