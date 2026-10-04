import {
  Check,
  Edit3,
  Trash2,
  Circle,
} from "lucide-react";

const categoryStyles = {
  Work: "bg-blue-100 text-blue-700",
  Personal: "bg-purple-100 text-purple-700",
  Urgent: "bg-red-100 text-red-700",
  Others: "bg-slate-100 text-slate-700",
};

function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        task.completed
          ? "border-green-200"
          : "border-slate-200"
      }`}
    >
      <div className="flex gap-4">
        <button
          onClick={() => onToggle(task._id)}
          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
            task.completed
              ? "border-green-500 bg-green-500 text-white"
              : "border-slate-300 text-transparent hover:border-indigo-500"
          }`}
        >
          <Check size={14} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3
                className={`font-semibold ${
                  task.completed
                    ? "text-slate-400 line-through"
                    : "text-slate-800"
                }`}
              >
                {task.title}
              </h3>

              {task.description && (
                <p
                  className={`mt-2 text-sm ${
                    task.completed
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  {task.description}
                </p>
              )}
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                categoryStyles[task.category] ||
                categoryStyles.Others
              }`}
            >
              {task.category}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {new Date(task.createdAt).toLocaleDateString()}
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(task)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                title="Edit"
              >
                <Edit3 size={17} />
              </button>

              <button
                onClick={() => onDelete(task._id)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                title="Delete"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;