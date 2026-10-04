import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  ListTodo,
  CheckCircle2,
  Clock3,
  AlertCircle,
} from "lucide-react";

import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import API from "../services/api";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const response = await API.get("/tasks");

      setTasks(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const createTask = async (taskData) => {
    try {
      const response = await API.post(
        "/tasks",
        taskData
      );

      setTasks((prev) => [
        response.data,
        ...prev,
      ]);

      setShowForm(false);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create task"
      );
    }
  };

  const updateTask = async (taskData) => {
    try {
      const response = await API.put(
        `/tasks/${editingTask._id}`,
        {
          ...taskData,
          completed: editingTask.completed,
        }
      );

      setTasks((prev) =>
        prev.map((task) =>
          task._id === editingTask._id
            ? response.data
            : task
        )
      );

      setEditingTask(null);
      setShowForm(false);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update task"
      );
    }
  };

  const handleFormSubmit = async (data) => {
    if (editingTask) {
      await updateTask(data);
    } else {
      await createTask(data);
    }
  };

  const toggleTask = async (id) => {
    try {
      const response = await API.patch(
        `/tasks/${id}/toggle`
      );

      setTasks((prev) =>
        prev.map((task) =>
          task._id === id
            ? response.data
            : task
        )
      );
    } catch (error) {
      alert("Failed to update task");
    }
  };

  const deleteTask = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/tasks/${id}`);

      setTasks((prev) =>
        prev.filter((task) => task._id !== id)
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete task"
      );
    }
  };

  const editTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const openCreateForm = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        task.description
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" ||
        task.category === filter;

      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = tasks.filter(
    (task) => !task.completed
  ).length;

  const urgentTasks = tasks.filter(
    (task) => task.category === "Urgent"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              Welcome back 👋
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-800">
              {user?.name}'s Tasks
            </h1>

            <p className="mt-2 text-slate-500">
              Organize your day and stay productive.
            </p>
          </div>

          <button
            onClick={openCreateForm}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
          >
            <Plus size={20} />
            Add Task
          </button>
        </div>

        {/* Statistics */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Tasks
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-800">
                  {totalTasks}
                </p>
              </div>

              <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                <ListTodo size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Completed
                </p>

                <p className="mt-1 text-3xl font-bold text-green-600">
                  {completedTasks}
                </p>
              </div>

              <div className="rounded-xl bg-green-100 p-3 text-green-600">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Pending
                </p>

                <p className="mt-1 text-3xl font-bold text-amber-600">
                  {pendingTasks}
                </p>
              </div>

              <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                <Clock3 size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Urgent
                </p>

                <p className="mt-1 text-3xl font-bold text-red-600">
                  {urgentTasks}
                </p>
              </div>

              <div className="rounded-xl bg-red-100 p-3 text-red-600">
                <AlertCircle size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Search + Filters */}

        <div className="mb-6 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search tasks..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="All">All Categories</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Urgent">Urgent</option>
            <option value="Others">Others</option>
          </select>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-red-600">
            {error}
          </div>
        )}

        {/* Tasks */}

        {loading ? (
          <div className="py-20 text-center text-slate-500">
            Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <ListTodo
              size={45}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 text-lg font-semibold text-slate-700">
              No tasks found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create a task to get started.
            </p>

            <button
              onClick={openCreateForm}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
            >
              Create Task
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggle={toggleTask}
                onEdit={editTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <TaskForm
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          editingTask={editingTask}
        />
      )}
    </div>
  );
}

export default Dashboard;