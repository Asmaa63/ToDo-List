// References to DOM elements
const taskInput = document.getElementById("taskInput");
const addTaskButton = document.getElementById("addTaskButton");
const taskList = document.getElementById("taskList");
const clearAllButton = document.getElementById("clearAllTasks");
const filterButtons = document.querySelectorAll(".filter-button");
const toast = document.getElementById("customToast");
const editModal = document.getElementById("editModal");
const editTaskInput = document.getElementById("editTaskInput");
const saveTaskButton = document.getElementById("saveTaskButton");
const closeModal = document.getElementById("closeModal");
const taskCounter = document.getElementById("taskCounter");

let taskToEditIndex = null;

// Retrieve tasks from local storage or initialize an empty array
let tasks = [];
try {
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
} catch (error) {
  console.error("Error parsing tasks from localStorage:", error);
}

// Load tasks and update counter on page load
window.onload = () => {
  renderTasks();
  updateTaskCounter();
};

// Enable or disable the Add Task button based on input field
if (taskInput && addTaskButton) {
  taskInput.addEventListener("input", () => {
    addTaskButton.disabled = !taskInput.value.trim();
  });
}

// Handle task actions (event delegation)
taskList.addEventListener("click", (event) => {
  const taskItem = event.target.closest(".task-item");
  if (!taskItem) return;

  const taskIndex = taskItem.dataset.index;
  const task = tasks[taskIndex];

  // Toggle completion
  if (event.target.classList.contains("complete-btn")) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateTaskCounter();
    showToast(
      task.completed ? "Task completed!" : "Task marked as pending!",
      "info"
    );
  }

  // Open modal for editing tasks
  if (event.target.classList.contains("edit-btn")) {
    taskToEditIndex = taskIndex;
    editTaskInput.value = task.text;
    editModal.style.display = "block";
  }

  // Delete task
  if (event.target.classList.contains("delete-btn")) {
    if (confirm("Are you sure you want to delete this task?")) {
      taskItem.classList.add("fade-out");
      setTimeout(() => {
        tasks.splice(taskIndex, 1);
        saveTasks();
        renderTasks();
        updateTaskCounter();
        showToast("Task deleted successfully!", "error");
      }, 400);
    }
  }
});

// Save task edits
saveTaskButton.addEventListener("click", () => {
  const newText = editTaskInput.value.trim();
  if (newText) {
    tasks[taskToEditIndex].text = newText;
    saveTasks();
    renderTasks();
    updateTaskCounter();
    showToast("Task edited successfully!", "success");
    editModal.style.display = "none";
  }
});

// Close modal
closeModal.addEventListener("click", () => {
  editModal.style.display = "none";
});

// Close modal when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === editModal) {
    editModal.style.display = "none";
  }
});

// Clear all tasks from the list
if (clearAllButton) {
  clearAllButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all tasks?")) {
      tasks = [];
      saveTasks();
      renderTasks();
      updateTaskCounter();
      showToast("All tasks cleared!", "info");
    }
  });
}

// Filter tasks based on the selected filter button
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    filterTasks(button.dataset.filter);
  });
});

// Drag-and-drop functionality
taskList.addEventListener("dragstart", (event) => {
  event.dataTransfer.setData("text/plain", event.target.dataset.index);
});

taskList.addEventListener("dragover", (event) => {
  event.preventDefault();
});

taskList.addEventListener("drop", (event) => {
  const fromIndex = event.dataTransfer.getData("text/plain");
  const toIndex = event.target.closest(".task-item")?.dataset.index;
  if (fromIndex && toIndex && fromIndex !== toIndex) {
    const movedTask = tasks.splice(fromIndex, 1)[0];
    tasks.splice(toIndex, 0, movedTask);
    saveTasks();
    renderTasks();
  }
});

// Render tasks based on the selected filter
const renderTasks = (filter = "all") => {
  taskList.innerHTML = "";

  const filteredTasks = tasks.filter((task) =>
    filter === "completed"
      ? task.completed
      : filter === "pending"
      ? !task.completed
      : true
  );

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `<p class="no-tasks">No tasks found for "${filter}"</p>`;
    return;
  }

  filteredTasks.forEach((task, index) => {
    const taskItem = document.createElement("li");
    taskItem.className = `task-item ${task.completed ? "completed" : ""}`;
    taskItem.draggable = true;

    const buttonColor = task.completed ? "#43a047" : "rgb(239, 159, 10)";

    taskItem.innerHTML = `
    <span class="task-text">${task.text}</span>
    <div class="task-buttons">
      <button class="complete-btn" style="background-color: ${buttonColor}; color: white;">${
      task.completed ? "Complete" : "Pending"
    }</button>
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    </div>`;
    taskItem.dataset.index = index;
    taskList.appendChild(taskItem);
  });

};

// Filter tasks based on the selected filter
function filterTasks(filter) {
  renderTasks(filter);
}

// Show a toast notification
function showToast(message, type = "info", duration = 3000) {
  if (!toast) return;

  clearTimeout(toast.dataset.timeoutId);
  toast.textContent = message;
  toast.className = `custom-toast ${type} show`;

  const timeoutId = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);

  toast.dataset.timeoutId = timeoutId;
}

// Save tasks to local storage
const saveTasks = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// Update the task counter
const updateTaskCounter = () => {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  taskCounter.textContent = `Completed: ${completedTasks}/${totalTasks}`;
};

// Add a new task to the list
if (addTaskButton) {
  addTaskButton.addEventListener("click", () => {
    const taskText = taskInput.value.trim();
    if (taskText) {
      tasks.push({ text: taskText, completed: false });
      saveTasks();
      renderTasks();
      updateTaskCounter();
      taskInput.value = "";
      addTaskButton.disabled = true;
      showToast("Task added successfully!", "success");
    }
  });
}
